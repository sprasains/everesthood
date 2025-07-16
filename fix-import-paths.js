#!/usr/bin/env node
/**
 * fix-import-paths.js
 * Logs potentially broken or incorrect import paths in .ts/.tsx files for manual review.
 */
const fs = require('fs');
const path = require('path');
const PROJECT_ROOT = process.cwd();
const FILE_EXTENSIONS = ['.ts', '.tsx'];
function getAllFiles(dir, extList, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, extList, fileList);
    } else if (extList.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  return fileList;
}
function main() {
  const files = getAllFiles(PROJECT_ROOT, FILE_EXTENSIONS);
  const importRegex = /import\s+.*from\s+['"](.*)['"]/g;
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (
        importPath.startsWith('.') &&
        !fs.existsSync(path.resolve(path.dirname(file), importPath + '.ts')) &&
        !fs.existsSync(path.resolve(path.dirname(file), importPath + '.tsx')) &&
        !fs.existsSync(path.resolve(path.dirname(file), importPath))
      ) {
        console.log(`Potential broken import in ${file}: ${importPath}`);
      }
    }
  });
  console.log('Import path check complete.');
}
main(); 