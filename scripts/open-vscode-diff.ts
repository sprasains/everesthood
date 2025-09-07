#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const sim = path.join(ROOT, '.route-similarity.json');
if (!fs.existsSync(sim)) {
  console.error('Similarity file not found:', sim);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: ts-node scripts/open-vscode-diff.ts <index>');
  process.exit(1);
}
const idx = parseInt(args[0], 10) - 1;
const raw = JSON.parse(fs.readFileSync(sim, 'utf8'));
const cand = raw.candidates && raw.candidates[idx];
if (!cand) {
  console.error('Candidate not found at index', idx + 1);
  process.exit(1);
}

const a = path.join(ROOT, cand.a);
const b = path.join(ROOT, cand.b);
if (!fs.existsSync(a) || !fs.existsSync(b)) {
  console.error('Files missing:', a, b);
  process.exit(1);
}

// Use code --diff on Windows; ensure path quoting
const cmd = `code --diff "${a}" "${b}"`;
console.log('Running:', cmd);
try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to open VS Code diff:', err);
}
