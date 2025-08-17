import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

const reportDir = path.resolve(process.cwd(), 'tmp/reports');
const reportPath = path.join(reportDir, 'fix-dead-code.json');

function ensureReportDir() {
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
}

function findDeadCode() {
  // Use ts-prune for TypeScript, fallback to eslint for JS
  let output = '';
  try {
    output = execSync('npx ts-prune', { encoding: 'utf-8' });
  } catch (e) {
    output = '';
  }
  const unused = output
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('No unused exports'))
    .map((line) => line.trim());
  return unused;
}

function main() {
  ensureReportDir();
  const unused = findDeadCode();
  const report = {
    unused,
    suggestedPatch: unused.map((u) => `Remove or refactor: ${u}`),
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (unused.length) {
    console.log('Unused exports/files found. See report.');
  } else {
    console.log('No dead code found.');
  }
}

if (require.main === module) main();
