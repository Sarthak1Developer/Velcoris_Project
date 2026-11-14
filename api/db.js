import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS enquiries (
	id text PRIMARY KEY NOT NULL,
	request_key text NOT NULL,
	request_hash text NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	organisation text DEFAULT '' NOT NULL,
	intent text NOT NULL,
	material text NOT NULL,
	message text NOT NULL,
	status text DEFAULT 'new' NOT NULL,
	revision integer DEFAULT 0 NOT NULL,
	created_at text NOT NULL,
	updated_at text NOT NULL,
	CONSTRAINT "enquiries_status_check" CHECK("enquiries"."status" IN ('new','in_progress','resolved'))
);
CREATE UNIQUE INDEX IF NOT EXISTS enquiries_request_key_unique ON enquiries (request_key);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries (created_at,id);
CREATE INDEX IF NOT EXISTS enquiries_status_created_idx ON enquiries (status,created_at);
CREATE TABLE IF NOT EXISTS rate_limits (
	bucket text PRIMARY KEY NOT NULL,
	count integer DEFAULT 1 NOT NULL,
	expires_at integer NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expiry_idx ON rate_limits (expires_at);
`;

const TURSO_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS enquiries (
	id text PRIMARY KEY NOT NULL,
	request_key text NOT NULL,
	request_hash text NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	organisation text DEFAULT '' NOT NULL,
	intent text NOT NULL,
	material text NOT NULL,
	message text NOT NULL,
	status text DEFAULT 'new' NOT NULL,
	revision integer DEFAULT 0 NOT NULL,
	created_at text NOT NULL,
	updated_at text NOT NULL,
	CONSTRAINT "enquiries_status_check" CHECK("enquiries"."status" IN ('new','in_progress','resolved'))
);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS enquiries_request_key_unique ON enquiries (request_key);`,
  `CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries (created_at,id);`,
  `CREATE INDEX IF NOT EXISTS enquiries_status_created_idx ON enquiries (status,created_at);`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
	bucket text PRIMARY KEY NOT NULL,
	count integer DEFAULT 1 NOT NULL,
	expires_at integer NOT NULL
);`,
  `CREATE INDEX IF NOT EXISTS rate_limits_expiry_idx ON rate_limits (expires_at);`
];

function createSqliteAdapter(database) {
  return {
    prepare(sql) {
      let values = [];
      return {
        bind(...bound) {
          values = bound;
          return this;
        },
        async first() {
          const stmt = database.prepare(sql);
          return stmt.get(...values) || null;
        },
        async all() {
          const stmt = database.prepare(sql);
          return { results: stmt.all(...values) };
        },
        async run() {
          const stmt = database.prepare(sql);
          const result = stmt.run(...values);
          return { success: true, meta: { changes: Number(result.changes) } };
        },
      };
    },
  };
}

function createTursoAdapter(url, token) {
  const httpUrl = url.replace(/^libsql:\/\//, 'https://').replace(/\/$/, '');
  const endpoint = `${httpUrl}/v2/pipeline`;

  async function query(sql, args = []) {
    const formattedArgs = args.map(arg => {
      if (arg === null || arg === undefined) return { type: 'null' };
      if (typeof arg === 'number') {
        if (Number.isInteger(arg)) return { type: 'integer', value: String(arg) };
        return { type: 'float', value: arg };
      }
      if (typeof arg === 'boolean') return { type: 'integer', value: arg ? '1' : '0' };
      return { type: 'text', value: String(arg) };
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql, args: formattedArgs } },
          { type: 'close' },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Turso request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const result = data.results?.[0];
    if (result?.type === 'error') {
      throw new Error(result.error?.message || 'Database query error');
    }

    const resp = result?.response?.result;
    const cols = resp?.cols || [];
    const rows = (resp?.rows || []).map(row => {
      const obj = {};
      for (let i = 0; i < cols.length; i++) {
        const colName = cols[i].name;
        const cell = row[i];
        if (!cell || cell.type === 'null') {
          obj[colName] = null;
        } else if (cell.type === 'integer') {
          const num = Number(cell.value);
          obj[colName] = Number.isSafeInteger(num) ? num : cell.value;
        } else if (cell.type === 'float') {
          obj[colName] = Number(cell.value);
        } else {
          obj[colName] = cell.value;
        }
      }
      return obj;
    });

    return {
      rows,
      changes: resp?.affected_row_count || 0,
    };
  }

  return {
    prepare(sql) {
      let values = [];
      return {
        bind(...bound) {
          values = bound;
          return this;
        },
        async first() {
          const res = await query(sql, values);
          return res.rows[0] || null;
        },
        async all() {
          const res = await query(sql, values);
          return { results: res.rows };
        },
        async run() {
          const res = await query(sql, values);
          return { success: true, meta: { changes: res.changes } };
        },
      };
    },
  };
}

function createMemoryStoreAdapter() {
  const enquiries = new Map();
  const rateLimits = new Map();

  return {
    prepare(sql) {
      let values = [];
      return {
        bind(...bound) {
          values = bound;
          return this;
        },
        async first() {
          if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
          if (sql.includes('request_key=?')) {
            const reqKey = values[0];
            for (const item of enquiries.values()) {
              if (item.request_key === reqKey) {
                return { id: item.id, created_at: item.created_at, request_hash: item.request_hash };
              }
            }
            return null;
          }
          if (sql.includes('SELECT id FROM enquiries WHERE id=?')) {
            const id = values[0];
            const item = enquiries.get(id);
            return item ? { id: item.id } : null;
          }
          if (sql.includes('FROM enquiries WHERE id=?')) {
            const id = values[0];
            return enquiries.get(id) || null;
          }
          if (sql.includes('COUNT(*) AS total FROM enquiries')) {
            return { total: enquiries.size };
          }
          if (sql.includes('INSERT INTO rate_limits')) {
            const bucket = values[0];
            const prev = rateLimits.get(bucket) || 0;
            rateLimits.set(bucket, prev + 1);
            return { count: prev + 1 };
          }
          return null;
        },
        async all() {
          if (sql.includes('FROM enquiries')) {
            let list = Array.from(enquiries.values());
            if (values.length > 0 && typeof values[0] === 'string' && ['new', 'in_progress', 'resolved'].includes(values[0])) {
              list = list.filter(e => e.status === values[0]);
            }
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { results: list };
          }
          return { results: [] };
        },
        async run() {
          if (sql.includes('INSERT INTO enquiries')) {
            const [id, request_key, request_hash, name, email, organisation, intent, material, message, status, created_at, updated_at] = values;
            enquiries.set(id, {
              id, request_key, request_hash, name, email, organisation, intent, material, message,
              status: status || 'new', revision: 0, created_at, updated_at
            });
            return { success: true, meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE enquiries SET status=?')) {
            const [status, updated_at, id, revision] = values;
            const item = enquiries.get(id);
            if (item && item.revision === revision) {
              item.status = status;
              item.revision += 1;
              item.updated_at = updated_at;
              return { success: true, meta: { changes: 1 } };
            }
            return { success: true, meta: { changes: 0 } };
          }
          if (sql.includes('DELETE FROM rate_limits')) {
            return { success: true, meta: { changes: 0 } };
          }
          return { success: true, meta: { changes: 1 } };
        }
      };
    }
  };
}

let dbInstance = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;

  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

  if (tursoUrl && (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('https://'))) {
    const adapter = createTursoAdapter(tursoUrl, tursoToken);
    for (const stmt of TURSO_STATEMENTS) {
      try {
        await adapter.prepare(stmt).run();
      } catch {
        // Table or index may already exist
      }
    }
    dbInstance = adapter;
    return dbInstance;
  }

  try {
    const isVercel = Boolean(process.env.VERCEL);
    const dbPath = process.env.SQLITE_PATH || (isVercel ? '/tmp/enquiries.sqlite' : path.resolve(process.cwd(), '.data/enquiries.sqlite'));
    const dir = path.dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const { DatabaseSync } = await import('node:sqlite');
    const database = new DatabaseSync(dbPath);
    database.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
    database.exec(MIGRATION_SQL);

    dbInstance = createSqliteAdapter(database);
    return dbInstance;
  } catch (error) {
    console.warn('Native SQLite unavailable, falling back to memory store:', error.message);
    dbInstance = createMemoryStoreAdapter();
    return dbInstance;
  }
}
