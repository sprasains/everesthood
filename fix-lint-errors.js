#!/usr/bin/env node
/**
 * fix-lint-errors.js
 * Runs ESLint with --fix on all .ts and .tsx files in the project to automatically fix lint errors.
 */
const { execSync } = require('child_process');
try {
  execSync('npx eslint --ext .ts,.tsx . --fix', { stdio: 'inherit' });
  console.log('\nLint errors fixed!');
} catch (err) {
  console.error('Failed to fix all lint errors. Please check your ESLint configuration and errors above.');
  process.exit(1);
} 