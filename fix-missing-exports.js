#!/usr/bin/env node
/**
 * fix-missing-exports.js
 * Adds export statements to top-level declarations in .ts/.tsx files if missing.
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
  const declRegex = /^(function|const|class)\s+([A-Z][A-Za-z0-9_]*)/gm;
  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    let match;
    while ((match = declRegex.exec(content)) !== null) {
      const name = match[2];
      const exportRegex = new RegExp(`export\s+(function|const|class)\s+${name}`);
      if (!exportRegex.test(content)) {
        content = content.replace(match[0], 'export ' + match[0]);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added export to: ${file}`);
    }
  });
  console.log('Missing export check complete.');
}
main(); 