#!/usr/bin/env node
/**
 * fix-mui-required-props.js
 * Logs MUI components missing required props in .tsx files for manual review.
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
  const muiRegex = /<(TextField|Button|Select|Checkbox|Radio|Switch|Slider|Autocomplete)(\s|>)/g;
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = muiRegex.exec(content)) !== null) {
      const comp = match[1];
      if (!/label=|variant=/.test(content.substring(match.index, match.index + 200))) {
        console.log(`Potential missing required prop for ${comp} in ${file}`);
      }
    }
  });
  console.log('MUI required prop check complete.');
}
main(); 