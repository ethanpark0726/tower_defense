import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const scanTargets = ['src', 'README.md', 'CHANGELOG.md', 'AGENTS.md', 'standalone_demo.html'];
const scannedExtensions = new Set(['.css', '.html', '.js', '.jsx', '.json', '.md']);
const koreanCharacters = /[\u3131-\u318e\uac00-\ud7a3]/u;
const violations = [];

const scanPath = async (relativePath) => {
  const absolutePath = path.join(projectRoot, relativePath);
  const targetStats = await stat(absolutePath);

  if (targetStats.isDirectory()) {
    const entries = await readdir(absolutePath, { withFileTypes: true });
    await Promise.all(entries.map((entry) => scanPath(path.join(relativePath, entry.name))));
    return;
  }

  if (!scannedExtensions.has(path.extname(relativePath).toLowerCase())) return;
  const contents = await readFile(absolutePath, 'utf8');
  if (koreanCharacters.test(contents)) violations.push(relativePath);
};

await Promise.all(scanTargets.map(scanPath));

if (violations.length > 0) {
  console.error('Korean characters were found in English-only product or documentation files:');
  violations.sort().forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log('English-only policy check passed.');
