import fs from 'fs';
import path from 'path';

// Reads required env schema from required-env.json
const schemaPath = path.resolve(process.cwd(), 'required-env.json');
const envPath = path.resolve(process.cwd(), '.env');
const reportDir = path.resolve(process.cwd(), 'tmp/reports');
const reportPath = path.join(reportDir, 'fix-missing-env.json');

function ensureReportDir() {
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
}

function readRequiredSchema() {
  if (!fs.existsSync(schemaPath))
    throw new Error('required-env.json not found');
  return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
}

function readEnvFile() {
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  return Object.fromEntries(
    lines
      .filter((line) => line.trim() && !line.startsWith('#'))
      .map((line) => {
        const [k, ...v] = line.split('=');
        return [k.trim(), v.join('=').trim()];
      })
  );
}

function main() {
  ensureReportDir();
  const required = readRequiredSchema();
  const env = readEnvFile();
  const missing = Object.keys(required).filter((k) => !(k in env));
  const report = {
    missing,
    required,
    env,
    suggestedPatch: missing.map((k) => `Add ${k} to .env`),
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (missing.length) {
    console.log(`Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  } else {
    console.log('All required env vars are present.');
  }
}

if (require.main === module) main();
