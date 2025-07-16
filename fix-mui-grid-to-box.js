#!/usr/bin/env node
/**
 * fix-mui-grid-to-box.js
 * Logs all usages of <Grid> from MUI in .tsx files for manual review and refactor.
 */
const fs = require('fs');
const path = require('path');
const PROJECT_ROOT = process.cwd();
function getAllFiles(dir, ext, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, ext, fileList);
    } else if (filePath.endsWith(ext)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}
function main() {
  const files = getAllFiles(PROJECT_ROOT, '.tsx');
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    if (/<Grid[\s>]/.test(content)) {
      console.log(`Found <Grid> usage in: ${file}`);
    }
  });
  console.log('MUI Grid usage check complete.');
}
main(); 