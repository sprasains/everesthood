// docs/_checklinks.ts
// CI script to validate all internal markdown links in docs and guides
// Usage: `ts-node docs/_checklinks.ts`

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve(__dirname, '..');
const MARKDOWN_EXT = ['.md', '.markdown'];

function findMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(findMarkdownFiles(fullPath));
    } else if (MARKDOWN_EXT.includes(path.extname(entry))) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractLinks(md: string): string[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(md))) {
    links.push(match[2]);
  }
  return links;
}

function checkLinks() {
  const files = findMarkdownFiles(DOCS_DIR);
  let broken: string[] = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const links = extractLinks(content);
    for (const link of links) {
      if (link.startsWith('http')) continue;
      const target = path.resolve(path.dirname(file), link);
      if (!fs.existsSync(target)) {
        broken.push(`${file}: ${link}`);
      }
    }
  }
  if (broken.length) {
    console.error('Broken links found:');
    for (const b of broken) console.error(b);
    process.exit(1);
  } else {
    console.log('All internal links are valid.');
  }
}

checkLinks();
