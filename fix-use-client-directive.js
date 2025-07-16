#!/usr/bin/env node
/**
 * fix-use-client-directive.js
 * Adds 'use client'; to the top of .tsx files in app/ that use client-only features but are missing the directive.
 */
const fs = require('fs');
const path = require('path');
const PROJECT_ROOT = process.cwd();
const APP_DIR = path.join(PROJECT_ROOT, 'app');
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
function needsClientDirective(content) {
  return (
    !content.startsWith('"use client"') &&
    (/use(State|Effect|Context|Reducer|Callback|Memo|Ref|LayoutEffect)/.test(content) ||
      /navigator|window|document/.test(content))
  );
}
function main() {
  const files = getAllFiles(APP_DIR, '.tsx');
  let changed = 0;
  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    if (needsClientDirective(content)) {
      content = '"use client";\n' + content;
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added 'use client' to: ${file}`);
      changed++;
    }
  });
  if (changed === 0) console.log('No files needed the client directive.');
  else console.log(`\nAdded 'use client' to ${changed} file(s).`);
}
main(); 