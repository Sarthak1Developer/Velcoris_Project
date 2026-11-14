import { createHandler } from '../prototype/worker/app.mjs';
import { getDatabase } from './db.js';

const handler = createHandler({});

export default async function vercelHandler(req, res) {
  try {
    const DB = await getDatabase();
    const env = {
      DB,
      ADMIN_KEY: process.env.ADMIN_KEY || 'oGdQoJ7iEDM8bwIrJT0zl0NcWm7DCjtg',
      RATE_LIMIT_SALT: process.env.RATE_LIMIT_SALT || 'vercel-production-salt',
      PRIVATE_SITE_BOUNDARY: false,
    };

    // Web Standard Request (Vercel Edge or modern runtime)
    if (req instanceof Request || (req.url && !res)) {
      const incoming = req;
      const proto = incoming.headers.get('x-forwarded-proto') || 'https';
      const host = incoming.headers.get('x-forwarded-host') || incoming.headers.get('host') || new URL(incoming.url).host;
      const normalized = new URL(incoming.url);
      normalized.protocol = proto;
      normalized.host = host;

      const webRequest = new Request(normalized.toString(), incoming);
      return await handler.fetch(webRequest, env);
    }

    // Node.js Serverless runtime (req: IncomingMessage, res: ServerResponse)
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers['host'] || '127.0.0.1';
    const url = `${proto}://${host}${req.url}`;
    const method = req.method;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(',') : value);
      }
    }

    let body = null;
    if (!['GET', 'HEAD'].includes(method)) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    const webRequest = new Request(url, {
      method,
      headers,
      body: body && body.length > 0 ? body : null,
    });

    const response = await handler.fetch(webRequest, env);

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Unhandled Vercel function error:', error);
    if (res && typeof res.status === 'function') {
      res.status(500).json({ error: 'Internal server error.' });
    } else if (res && typeof res.writeHead === 'function') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error.' }));
    } else {
      return new Response(JSON.stringify({ error: 'Internal server error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}

