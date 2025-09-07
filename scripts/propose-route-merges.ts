#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const SIM_FILE = path.join(ROOT, '.route-similarity.json');

function usage() {
  console.log(
    'Usage: ts-node scripts/propose-route-merges.ts --top N [--reverse] [--delete] [--branch name]'
  );
  process.exit(1);
}

if (!fs.existsSync(SIM_FILE)) {
  console.error('Similarity file not found:', SIM_FILE);
  process.exit(1);
}

const args = process.argv.slice(2);
const topArg = (() => {
  const i = args.indexOf('--top');
  if (i === -1) return 25;
  const v = parseInt(args[i + 1], 10);
  return Number.isNaN(v) ? 25 : v;
})();
const reverse = args.includes('--reverse');
const doDelete = args.includes('--delete');
const skipChecks = args.includes('--skip-checks');
const branchNameArgIndex = args.indexOf('--branch');
const branchName = branchNameArgIndex > -1 ? args[branchNameArgIndex + 1] : '';

const raw = JSON.parse(fs.readFileSync(SIM_FILE, 'utf8'));
const candidates: Array<any> = raw.candidates || [];

const selected = candidates.slice(0, topArg);
if (selected.length === 0) {
  console.log('No candidates found in', SIM_FILE);
  process.exit(0);
}

// Create a branch
const time = new Date().toISOString().replace(/[:.]/g, '-');
const branch = branchName || `route-merge/top-${topArg}-${time}`;
try {
  execSync(`git checkout -b ${branch}`, { stdio: 'inherit' });
  console.log('Created branch', branch);
} catch (err) {
  console.warn(
    'Could not create branch (maybe already exists) - continuing on current branch'
  );
}

// lazy-load ts-morph when needed
async function run() {
  const { Project } = require('ts-morph');
  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  function abs(p: string) {
    return path.join(ROOT, p).replace(/\\/g, '/');
  }

  const updatedFiles = new Set<string>();

  const bakDir = path.join(ROOT, '.route-merge-backups');
  if (!fs.existsSync(bakDir)) fs.mkdirSync(bakDir);

  for (const [idx, c] of selected.entries()) {
    const aRel = reverse ? c.b : c.a;
    const bRel = reverse ? c.a : c.b;
    const aAbs = abs(aRel);
    const bAbs = abs(bRel);

    if (!fs.existsSync(aAbs) || !fs.existsSync(bAbs)) {
      console.warn(`#${idx + 1} missing file(s):`, aRel, bRel);
      continue;
    }

    console.log(`#${idx + 1} merging -> ${aRel}  <-- ${bRel}`);

    const aSf = project.addSourceFileAtPath(aAbs);
    const bSf = project.addSourceFileAtPath(bAbs);

    const aExports = new Set(Array.from(aSf.getExportedDeclarations().keys()));
    const bExports = bSf.getExportedDeclarations();

    let appended = '';
    for (const [name, decls] of bExports) {
      if (aExports.has(name)) continue; // already exported
      // take first declaration text and append
      const decl = decls[0];
      try {
        const text = decl.getText();
        appended += `\n/* MERGED EXPORT FROM ${bRel} - ${name} */\n${text}\n`;
      } catch (err) {
        console.warn('Failed to extract decl text for', name, 'skipping');
      }
    }

    // handle default export if target lacks it
    const aHasDefault = aSf.getDefaultExportSymbol() != null;
    const bHasDefault = bSf.getDefaultExportSymbol() != null;
    if (!aHasDefault && bHasDefault) {
      try {
        const def = bSf.getDefaultExportSymbol();
        if (def) {
          const defs = def.getDeclarations();
          if (defs && defs.length > 0) {
            appended += `\n/* MERGED DEFAULT EXPORT FROM ${bRel} */\n${defs[0].getText()}\n`;
          }
        }
      } catch (err) {
        // fallback: create re-export
        const rel = path
          .relative(path.dirname(aAbs), bAbs)
          .replace(/\\/g, '/')
          .replace(/\.(tsx|ts|js|jsx)$/, '');
        const relSpecifier = rel.startsWith('.') ? rel : './' + rel;
        appended += `\n/* MERGED DEFAULT (re-export) FROM ${bRel} */\nexport { default as _MergedDefaultFrom${idx} } from '${relSpecifier}';\n`;
      }
    }

    if (appended) {
      // backup
      const bakDir = path.join(ROOT, '.route-merge-backups');
      if (!fs.existsSync(bakDir)) fs.mkdirSync(bakDir);
      const bakPath = path.join(bakDir, path.basename(aRel) + '.' + Date.now());
      fs.copyFileSync(aAbs, bakPath);

      // append to file
      fs.appendFileSync(
        aAbs,
        `\n/* ROUTE CANONICAL — merged from ${bRel} */\n${appended}`,
        'utf8'
      );
      updatedFiles.add(aRel);
      console.log('Appended', Object.keys(bExports).length, 'exports to', aRel);
    } else {
      console.log('No new exports found to merge for', aRel);
    }

    // optionally delete source and rewrite imports
    if (doDelete) {
      try {
        // naive import rewrite: replace module specifiers that resolve to bRel
        const srcFiles = project.addSourceFilesAtPaths([
          path.join(ROOT, '**/*.{ts,tsx,js,jsx}'),
        ]);
        const bResolved = bAbs;
        for (const sf of srcFiles) {
          let changed = false;
          for (const id of sf.getImportDeclarations()) {
            const spec = id.getModuleSpecifierValue();
            try {
              const resolved = require('ts-node').create().compilerOptions; // noop to avoid ts-node missing
            } catch (_) {}
            // simplistic: if spec contains basename of bRel, replace with relative path to aRel
            if (
              spec.includes(
                path.basename(bRel).replace(/\.(ts|tsx|js|jsx)$/, '')
              )
            ) {
              const newRel = path
                .relative(path.dirname(sf.getFilePath()), aAbs)
                .replace(/\\/g, '/')
                .replace(/\.(tsx|ts|jsx|js)$/, '');
              let out = newRel.startsWith('.') ? newRel : './' + newRel;
              id.setModuleSpecifier(out);
              changed = true;
            }
          }
          if (changed) {
            fs.copyFileSync(
              sf.getFilePath(),
              path.join(
                bakDir,
                path.basename(sf.getFilePath()) + '.' + Date.now()
              )
            );
            sf.saveSync();
            console.log('Rewrote imports in', sf.getFilePath());
          }
        }

        // remove source file
        fs.unlinkSync(bAbs);
        console.log('Deleted source file', bRel);
      } catch (err) {
        console.warn('Failed to delete and rewrite imports for', bRel, err);
      }
    }
  }

  // stage and commit (with an optional typecheck gate)
  try {
    const filesToAdd = Array.from(updatedFiles).map((p) => path.join(ROOT, p));
    if (filesToAdd.length === 0) {
      console.log('No files changed; nothing to commit.');
      return;
    }

    if (!skipChecks) {
      try {
        console.log('Running typecheck before committing...');
        execSync('npm run typecheck', { stdio: 'inherit' });
      } catch (err) {
        console.warn(
          'Typecheck failed — aborting commit. Re-run with --skip-checks to override.'
        );
        return;
      }
    } else {
      console.log('--skip-checks provided; skipping typecheck.');
    }

    execSync(`git add ${filesToAdd.map((p) => '"' + p + '"').join(' ')}`, {
      stdio: 'inherit',
    });
    execSync(
      `git commit -m "chore: propose route merges (automated best-effort)"`,
      { stdio: 'inherit' }
    );
    console.log('Committed changes on branch', branch);
  } catch (err) {
    console.warn('Git commit failed:', err);
  }
}

run().then(() =>
  console.log(
    'Done. To push and open a PR: git push -u origin',
    branch,
    '&& gh pr create --fill'
  )
);
