import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHandler } from '../worker/app.mjs';
import { openLocalDatabase } from './local-db.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(path.join(root, '.data'), { recursive: true });
const { DB } = openLocalDatabase(path.join(root, '.data/enquiries.sqlite'), root);
const keyFile = path.join(root, '.data/admin_key.txt');

let ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
  if (existsSync(keyFile)) {
    ADMIN_KEY = readFileSync(keyFile, 'utf8').trim();
  } else {
    ADMIN_KEY = 'oGdQoJ7iEDM8bwIrJT0zl0NcWm7DCjtg';
    writeFileSync(keyFile, ADMIN_KEY, 'utf8');
  }
}

const port = Number(process.env.PORT || 8787);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const assets = Object.fromEntries(
  readdirSync(path.join(root, 'public')).map(filename => [
    '/' + filename,
    { body: readFileSync(path.join(root, 'public', filename), 'utf8'), type: types[path.extname(filename)] },
  ])
);

const handler = createHandler(assets);
const server = createServer(async (incoming, outgoing) => {
  try {
    const url = `http://127.0.0.1:${port}${incoming.url}`;
    const method = incoming.method;
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(',') : value);
    }
    let size = 0, body = [];
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 16384) {
        outgoing.writeHead(413);
        outgoing.end('Request too large');
        return;
      }
      body.push(chunk);
    }
    const request = new Request(url, {
      method,
      headers,
      ...(!['GET', 'HEAD'].includes(method) ? { body: Buffer.concat(body) } : {}),
    });
    const response = await handler.fetch(request, {
      DB,
      ADMIN_KEY,
      PRIVATE_SITE_BOUNDARY: false,
      RATE_LIMIT_SALT: 'local-development',
    });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(500);
    outgoing.end('Request failed');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`\n========================================`);
  console.log(`Velcoris Prototype Dev Server Running`);
  console.log(`Local Website: http://127.0.0.1:${port}`);
  console.log(`Enquiry Desk:  http://127.0.0.1:${port}/admin`);
  console.log(`Access Key:    ${ADMIN_KEY}`);
  console.log(`Database:      .data/enquiries.sqlite`);
  console.log(`========================================\n`);
});
