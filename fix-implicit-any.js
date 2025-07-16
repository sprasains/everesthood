#!/usr/bin/env node
/**
 * fix-implicit-any.js
 * Logs all function parameters and variables with implicit any types in .ts/.tsx files for manual review.
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
  const anyRegex = /function\s+\w+\s*\(([^)]*)\)\s*{/g;
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = anyRegex.exec(content)) !== null) {
      const params = match[1];
      if (params && params.split(',').some(p => p.trim() && !/:/.test(p))) {
        console.log(`Potential implicit any in function params in ${file}: ${params}`);
      }
    }
  });
  console.log('Implicit any check complete.');
}
main(); 