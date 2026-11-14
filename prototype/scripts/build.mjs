import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = {};
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

for (const filename of await readdir(path.join(root, 'public'))) {
  const type = types[path.extname(filename)];
  if (!type) throw new Error('Unsupported asset: ' + filename);
  assets['/' + filename] = {
    body: await readFile(path.join(root, 'public', filename), 'utf8'),
    type,
  };
}

const source = await readFile(path.join(root, 'worker/app.mjs'), 'utf8');
await mkdir(path.join(root, 'dist/server'), { recursive: true });
await writeFile(
  path.join(root, 'dist/server/index.js'),
  'const ASSETS=' + JSON.stringify(assets) + ';\n' +
  source.replace('export function createHandler', 'function createHandler') +
  '\nexport default createHandler(ASSETS);\n'
);
console.log('Built worker bundle with ' + Object.keys(assets).length + ' embedded assets.');
