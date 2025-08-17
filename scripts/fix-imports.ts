import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

const reportDir = path.resolve(process.cwd(), 'tmp/reports');
const reportPath = path.join(reportDir, 'fix-imports.json');

function ensureReportDir() {
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
}

function organizeImports(file: string) {
  try {
    execSync(`npx prettier --write "${file}"`);
    execSync(`npx eslint --fix "${file}"`);
    return { file, status: 'fixed' };
  } catch (e) {
    return { file, status: 'error', error: e.message };
  }
}

function main() {
  ensureReportDir();
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
    ignore: 'node_modules/**',
  });
  const results = files.map(organizeImports);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Import organization complete. Report written to ${reportPath}`);
}

if (require.main === module) main();
