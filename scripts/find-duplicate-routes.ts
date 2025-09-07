#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

type RouteFile = {
  filePath: string;
  route: string;
  relPath: string;
  content: string;
  length: number;
  components: number;
  liveFetches: number;
  isAppDir: boolean;
  score: number;
};

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'app');
const PAGES_DIR = path.join(ROOT, 'pages');

function walkDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results.push(...walkDir(full));
    } else {
      if (
        full.endsWith('.tsx') ||
        full.endsWith('.ts') ||
        full.endsWith('.jsx') ||
        full.endsWith('.js')
      ) {
        results.push(full);
      }
    }
  }
  return results;
}

function routeForPath(filePath: string): string {
  // Derive route by removing base dir and file extension and index handling
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel.startsWith('app/')) {
    // app routes use folder structure; file names like page.tsx map to folder route
    const withoutApp = rel.replace(/^app\//, '');
    const parts = withoutApp.split('/');
    // drop file if it's page.* or route segment
    if (parts[parts.length - 1].startsWith('page.')) parts.pop();
    const route =
      '/' +
      parts
        .join('/')
        .replace(/index\.(tsx|ts|jsx|js)$/, '')
        .replace(/\.(tsx|ts|jsx|js)$/, '');
    return route === '/' ? '/' : route.replace(/\/\/$/, '/');
  }

  if (rel.startsWith('pages/')) {
    const withoutPages = rel.replace(/^pages\//, '');
    const route =
      '/' +
      withoutPages.replace(/\.(tsx|ts|jsx|js)$/, '').replace(/index$/, '');
    return route.replace(/\/\/$/, '/').replace(/\/\/$/, '/');
  }

  return '/' + rel.replace(/\.(tsx|ts|jsx|js)$/, '');
}

function analyzeFile(filePath: string, isAppDir: boolean): RouteFile {
  const content = fs.readFileSync(filePath, 'utf8');
  const length = content.length;
  const components = (
    content.match(
      /export\s+default\s+function|export\s+default|function\s+[A-Z]|const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\(/g
    ) || []
  ).length;
  const liveFetches = (
    content.match(
      /fetch\(|getServerSideProps|getStaticProps|revalidate|use\([^)]*fetch/g
    ) || []
  ).length;
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const route = routeForPath(filePath);

  // scoring: prefer app dir slightly; weight liveFetches highly
  const baseScore =
    length * 0.01 + components * 10 + liveFetches * 100 + (isAppDir ? 25 : 0);

  return {
    filePath,
    route,
    relPath,
    content,
    length,
    components,
    liveFetches,
    isAppDir,
    score: baseScore,
  };
}

function findRouteGroups(files: RouteFile[]) {
  const map = new Map<string, RouteFile[]>();
  for (const f of files) {
    const key = f.route;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(f);
  }
  return map;
}

function makePlan(map: Map<string, RouteFile[]>) {
  const plan: any[] = [];
  for (const [route, files] of map) {
    if (files.length <= 1) continue;
    // rank
    const ranked = [...files].sort((a, b) => b.score - a.score);
    const keep = ranked[0];
    const others = ranked.slice(1);
    plan.push({
      route,
      keep: keep.relPath,
      candidates: ranked.map((r) => ({ path: r.relPath, score: r.score })),
      others: others.map((o) => o.relPath),
    });
  }
  return plan;
}

function writePlan(plan: any[], out = '.route-duplicates.json') {
  fs.writeFileSync(
    path.join(ROOT, out),
    JSON.stringify({ generatedAt: new Date().toISOString(), plan }, null, 2)
  );
  console.log('Wrote plan to', out);
}

function backupFile(filePath: string) {
  const backupDir = path.join(ROOT, '.route-merge-backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  const dest = path.join(backupDir, path.basename(filePath) + '.' + Date.now());
  fs.copyFileSync(filePath, dest);
  return dest;
}

function insertBanner(keepPath: string, mergedPaths: string[]) {
  const abs = path.join(ROOT, keepPath);
  let content = fs.readFileSync(abs, 'utf8');
  const banner = `// ROUTE CANONICAL — merged from [${mergedPaths.join(
    ', '
  )}], see docs/ROUTE_CONVENTIONS.md\n`;
  if (!content.startsWith('// ROUTE CANONICAL')) {
    content = banner + content;
    fs.writeFileSync(abs, content, 'utf8');
  }
}

function mergeSnippets(keepPath: string, fromPath: string) {
  const keepAbs = path.join(ROOT, keepPath);
  const fromAbs = path.join(ROOT, fromPath);
  const fromContent = fs.readFileSync(fromAbs, 'utf8');
  const snippet = `\n/* MERGED FROM ${fromPath} - BEGIN (automated best-effort, please review) */\n${fromContent}\n/* MERGED FROM ${fromPath} - END */\n`;
  fs.appendFileSync(keepAbs, snippet, 'utf8');
}

// AST-based import rewrite using ts-morph (safer than simple string replace)
function replaceImports(targetOld: string, targetNew: string) {
  try {
    const { Project, SyntaxKind } = require('ts-morph');
    const project = new Project({
      tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
    });
    const srcFiles = walkDir(ROOT).filter(
      (f) => !/node_modules|\.next|\.git/.test(f)
    );
    project.addSourceFilesAtPaths(srcFiles);

    const absOld = path.join(ROOT, targetOld).replace(/\\/g, '/');
    const absNew = path.join(ROOT, targetNew).replace(/\\/g, '/');

    const sourceFiles = project.getSourceFiles();
    for (const sf of sourceFiles) {
      const sfPath = sf.getFilePath();
      let changed = false;

      // update import declarations
      const imports = sf.getImportDeclarations();
      for (const id of imports) {
        const spec = id.getModuleSpecifierValue();
        const resolved = resolveModuleToFile(spec, sfPath);
        if (!resolved) continue;
        const resolvedNormalized = path.resolve(resolved).replace(/\\/g, '/');
        if (resolvedNormalized === absOld) {
          const newRel = makeRelativeModuleSpecifier(sfPath, absNew);
          id.setModuleSpecifier(newRel);
          changed = true;
        }
      }

      // update require(...) calls
      const calls = sf.getDescendantsOfKind(SyntaxKind.CallExpression);
      for (const c of calls) {
        const expr = c.getExpression().getText();
        if (expr === 'require') {
          const args = c.getArguments();
          if (args.length > 0) {
            const first = args[0];
            if (first && first.getKind() === SyntaxKind.StringLiteral) {
              const val = first.getLiteralText();
              const resolved = resolveModuleToFile(val, sfPath);
              if (
                resolved &&
                path.resolve(resolved).replace(/\\/g, '/') === absOld
              ) {
                const newRel = makeRelativeModuleSpecifier(sfPath, absNew);
                first.replaceWithText('"' + newRel + '"');
                changed = true;
              }
            }
          }
        }
      }

      if (changed) {
        const rel = path.relative(ROOT, sfPath);
        backupFile(rel);
        sf.saveSync();
        console.log('Updated imports in', sfPath);
      }
    }
  } catch (err) {
    console.error(
      'AST import rewrite failed, falling back to naive replace',
      err
    );
    // fallback naive replace
    const searchRoot = ROOT;
    const files = walkDir(searchRoot).filter(
      (f) => !f.includes('node_modules')
    );
    const relOld =
      './' +
      path.relative(path.dirname(targetOld), targetOld).replace(/\\/g, '/');
    for (const f of files) {
      let content = fs.readFileSync(f, 'utf8');
      if (
        content.includes(targetOld) ||
        content.includes(targetNew) ||
        content.includes(relOld)
      ) {
        const repoRelOld = targetOld.replace(/\\/g, '/');
        const repoRelNew = targetNew.replace(/\\/g, '/');
        content = content.split(repoRelOld).join(repoRelNew);
        fs.writeFileSync(f, content, 'utf8');
      }
    }
  }
}

function resolveModuleToFile(
  spec: string,
  sourceFilePath: string
): string | null {
  // handle alias paths
  if (spec.startsWith('@/')) {
    const sub = spec.replace(/^@\//, 'src/');
    const abs = path.join(ROOT, sub);
    const resolved = findExistingWithExt(abs);
    if (resolved) return resolved;
  }

  if (spec.startsWith('../') || spec.startsWith('./') || spec.startsWith('/')) {
    const abs = path.resolve(path.dirname(sourceFilePath), spec);
    const resolved = findExistingWithExt(abs);
    if (resolved) return resolved;
  }

  return null;
}

function findExistingWithExt(base: string): string | null {
  const exts = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '/index.ts',
    '/index.tsx',
    '/index.js',
  ];
  for (const e of exts) {
    const p = base.endsWith(e) ? base : base + e;
    if (fs.existsSync(p)) return p;
  }
  if (fs.existsSync(base)) return base;
  return null;
}

function makeRelativeModuleSpecifier(fromFile: string, targetAbs: string) {
  const rel = path
    .relative(path.dirname(fromFile), targetAbs)
    .replace(/\\/g, '/');
  let out = rel;
  if (!out.startsWith('.')) out = './' + out;
  out = out.replace(/\.(tsx|ts|jsx|js)$/, '');
  return out;
}

// ------------------------ fuzzy similarity helpers ------------------------
function tokenizeContent(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(a: Set<string>, b: Set<string>) {
  const is = new Set<string>();
  for (const x of a) if (b.has(x)) is.add(x);
  const uni = new Set([...a, ...b]);
  return uni.size === 0 ? 0 : is.size / uni.size;
}

function shingles(s: string, k = 3) {
  const toks = tokenizeContent(s);
  const set = new Set<string>();
  for (let i = 0; i <= toks.length - k; i++)
    set.add(toks.slice(i, i + k).join(' '));
  return set;
}

function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function normalizedLevenshtein(a: string, b: string) {
  if (!a.length && !b.length) return 1;
  const d = levenshtein(a, b);
  return 1 - d / Math.max(a.length, b.length);
}

function componentNameSet(content: string) {
  const matches = content.match(
    /function\s+([A-Z][A-Za-z0-9_]*)|const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\(/g
  );
  if (!matches) return new Set<string>();
  const names = matches.map((m) =>
    m.replace(/function\s+|const\s+|\s*\=\s*\(/g, '').trim()
  );
  return new Set(names);
}

function generateSimilarityReport(
  files: RouteFile[],
  opts: { threshold: number } = { threshold: 0.4 }
) {
  const candidates: any[] = [];
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const a = files[i];
      const b = files[j];

      // quick route proximity: compare segments
      const segA = a.route.split('/').filter(Boolean);
      const segB = b.route.split('/').filter(Boolean);
      const segOverlap =
        segA.filter((s) => segB.includes(s)).length /
        Math.max(1, Math.max(segA.length, segB.length));

      const shA = shingles(a.content);
      const shB = shingles(b.content);
      const shJ = jaccard(shA, shB);

      const nameSim = normalizedLevenshtein(a.relPath, b.relPath);

      const compA = componentNameSet(a.content);
      const compB = componentNameSet(b.content);
      const compJ = jaccard(compA, compB);

      // weighted score
      const score =
        0.45 * shJ + 0.2 * compJ + 0.15 * segOverlap + 0.2 * nameSim;

      if (score >= opts.threshold) {
        candidates.push({
          a: a.relPath,
          b: b.relPath,
          routeA: a.route,
          routeB: b.route,
          score: Math.round(score * 1000) / 1000,
          shJ,
          compJ,
          segOverlap,
          nameSim,
        });
      }
    }
  }
  // sort descending
  candidates.sort((x, y) => y.score - x.score);
  return candidates;
}

async function applyPlan(plan: any[]) {
  for (const p of plan) {
    const keep = p.keep;
    const others = p.others;
    console.log('Processing route', p.route, 'keep=', keep, 'others=', others);
    // backup keep
    backupFile(path.join(ROOT, keep));
    insertBanner(keep, [keep, ...others]);
    for (const o of others) {
      try {
        backupFile(path.join(ROOT, o));
        mergeSnippets(keep, o);
        // delete weaker file
        fs.unlinkSync(path.join(ROOT, o));
        // attempt import replacement
        replaceImports(o, keep);
        console.log('Merged and removed', o);
      } catch (err) {
        console.error('Failed merging', o, err);
      }
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const fuzzy = args.includes('--fuzzy') || args.includes('--similar');
  const files = [...walkDir(APP_DIR), ...walkDir(PAGES_DIR)];
  const analyzed = files.map((f) => analyzeFile(f, f.startsWith(APP_DIR)));
  const groups = findRouteGroups(analyzed);
  const plan = makePlan(groups);
  writePlan(plan);
  if (fuzzy) {
    const simReport = generateSimilarityReport(analyzed, { threshold: 0.35 });
    const out = '.route-similarity.json';
    fs.writeFileSync(
      path.join(ROOT, out),
      JSON.stringify(
        { generatedAt: new Date().toISOString(), candidates: simReport },
        null,
        2
      )
    );
    console.log(
      'Wrote similarity report to',
      out,
      'candidates:',
      simReport.length
    );
  }
  if (plan.length > 0) {
    console.log('Found', plan.length, 'duplicate route groups.');
    for (const p of plan)
      console.log(
        '-',
        p.route,
        'keep=',
        p.keep,
        'others=',
        p.others.join(', ')
      );
    if (apply) {
      console.log(
        'Applying plan (best-effort) ... backups in .route-merge-backups'
      );
      applyPlan(plan).then(() => console.log('Apply complete'));
    } else {
      console.log(
        'Run with --apply to attempt automatic merge (best-effort). Please review .route-duplicates.json first.'
      );
    }
    process.exitCode = apply ? 0 : 2; // non-zero when duplicates exist to help CI/husky
  } else {
    console.log('No duplicate routes found.');
    process.exitCode = 0;
  }
}

main();
