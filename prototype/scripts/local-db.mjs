import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export function openLocalDatabase(filename, root) {
  const database = new DatabaseSync(filename);
  database.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  database.exec('CREATE TABLE IF NOT EXISTS __local_migrations (tag TEXT PRIMARY KEY)');

  const journal = JSON.parse(readFileSync(path.join(root, 'drizzle/meta/_journal.json'), 'utf8'));
  for (const entry of journal.entries) {
    if (!database.prepare('SELECT tag FROM __local_migrations WHERE tag=?').get(entry.tag)) {
      const sql = readFileSync(path.join(root, 'drizzle', entry.tag + '.sql'), 'utf8');
      database.exec('BEGIN');
      try {
        database.exec(sql);
        database.prepare('INSERT INTO __local_migrations(tag) VALUES (?)').run(entry.tag);
        database.exec('COMMIT');
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    }
  }

  const DB = {
    prepare(sql) {
      let values = [];
      return {
        bind(...bound) {
          values = bound;
          return this;
        },
        async first() {
          return database.prepare(sql).get(...values) || null;
        },
        async all() {
          return { results: database.prepare(sql).all(...values) };
        },
        async run() {
          const result = database.prepare(sql).run(...values);
          return { success: true, meta: { changes: Number(result.changes) } };
        },
      };
    },
  };

  return { database, DB };
}
