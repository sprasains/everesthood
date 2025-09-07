#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SIM_FILE = path.join(ROOT, '.route-similarity.json');

if (!fs.existsSync(SIM_FILE)) {
  console.error('Similarity file not found:', SIM_FILE);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(SIM_FILE, 'utf8'));
const candidates: Array<any> = raw.candidates || [];

const top = parseInt(process.argv[2] || '25', 10);

const outLines: string[] = [];
outLines.push('# Route Similarity Report');
outLines.push('Generated at: ' + raw.generatedAt);
outLines.push('');
outLines.push(`Top ${top} candidate pairs by similarity score`);
outLines.push('');
outLines.push('| # | Score | A | B | route A | route B |');
outLines.push('|---|-------:|---|---|---|---|');

for (let i = 0; i < Math.min(top, candidates.length); i++) {
  const c = candidates[i];
  const aPath = c.a;
  const bPath = c.b;
  const repoUrlBase = ''; // local paths for quick VS Code open
  const aLink = 'file://' + path.join(ROOT, aPath).replace(/\\/g, '/');
  const bLink = 'file://' + path.join(ROOT, bPath).replace(/\\/g, '/');
  const line =
    '| ' +
    (i + 1) +
    ' | ' +
    c.score +
    ' | ' +
    '[A](' +
    aLink +
    ')' +
    ' | ' +
    '[B](' +
    bLink +
    ')' +
    ' | `' +
    c.routeA +
    '` | `' +
    c.routeB +
    '` |';
  outLines.push(line);
}

const out = path.join(ROOT, 'SIMILARITY_REPORT.md');
fs.writeFileSync(out, outLines.join('\n'), 'utf8');
console.log('Wrote', out);
