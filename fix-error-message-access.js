#!/usr/bin/env node

/**
 * fix-error-message-access.js
 *
 * Scans all .ts and .tsx files in the project for unsafe error.message access in catch blocks
 * and replaces them with a type guard pattern for safe error handling.
 *
 * Usage: node fix-error-message-access.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const FILE_EXTENSIONS = ['.ts', '.tsx'];

function getAllFiles(dir, extList, fileList = []) {
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

function fixErrorMessageAccess(content, filePath) {
  // Regex to find catch blocks and error.message access
  // This is a best-effort approach and may not catch all edge cases
  const catchRegex = /catch\s*\(([^)]+)\)\s*{([\s\S]*?)}(?!\s*catch)/g;
  let changed = false;

  const newContent = content.replace(catchRegex, (match, errVar, block) => {
    // Only process if .message is accessed in the block
    const messageAccessRegex = new RegExp(`${errVar}\\.message`, 'g');
    if (!messageAccessRegex.test(block)) return match;
    changed = true;
    // Replace all errVar.message with errorMessage
    const newBlock = block.replace(messageAccessRegex, 'errorMessage');
    // Insert type guard at the top of the catch block
    const guard = `const errorMessage = typeof ${errVar} === "object" && ${errVar} !== null && "message" in ${errVar} ? (${errVar} ).message : String(${errVar});`;
    return `catch (${errVar}) {\n      ${guard}\n${newBlock}\n    }`;
  });

  return { newContent, changed };
}

function main() {
  const files = getAllFiles(PROJECT_ROOT, FILE_EXTENSIONS);
  let totalChanged = 0;
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const { newContent, changed } = fixErrorMessageAccess(content, file);
    if (changed) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Fixed error.message access in: ${file}`);
      totalChanged++;
    }
  });
  if (totalChanged === 0) {
    console.log('No unsafe error.message access found.');
  } else {
    console.log(`\nFixed error.message access in ${totalChanged} file(s).`);
  }
}

main(); 