import fs from 'fs';
import path from 'path';
import glob from 'glob';

const reportDir = path.resolve(process.cwd(), 'tmp/reports');
const reportPath = path.join(reportDir, 'fix-routes.json');

function ensureReportDir() {
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
}

function findApiRoutes() {
  // Next.js convention: /app/api or /pages/api
  const apiFiles = glob
    .sync('app/api/**/*.ts', { ignore: 'node_modules/**' })
    .concat(glob.sync('pages/api/**/*.ts', { ignore: 'node_modules/**' }));
  return apiFiles;
}

function findMissingHandlers(apiFiles: string[]) {
  // Check for files missing a default export (handler)
  return apiFiles.filter((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    return !/export\s+default\s+/g.test(content);
  });
}

function main() {
  ensureReportDir();
  const apiFiles = findApiRoutes();
  const missingHandlers = findMissingHandlers(apiFiles);
  const report = {
    apiFiles,
    missingHandlers,
    suggestedPatch: missingHandlers.map(
      (f) => `Add default export handler to ${f}`
    ),
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (missingHandlers.length) {
    console.log('Missing API handlers found. See report.');
  } else {
    console.log('All API routes have handlers.');
  }
}

if (require.main === module) main();
