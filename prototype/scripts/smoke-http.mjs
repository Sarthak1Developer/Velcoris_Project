import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 18787, key = 'local-smoke-test-only';
const child = spawn(process.execPath, ['scripts/dev.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), ADMIN_KEY: key },
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stdout = '', stderr = '';
child.stdout.on('data', b => stdout += b);
child.stderr.on('data', b => stderr += b);

const origin = `http://127.0.0.1:${port}`;
try {
  const started = Date.now();
  while (!stdout.includes('Local Website:')) {
    if (Date.now() - started > 15000) throw new Error('Local server did not become ready: ' + stderr);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const homepage = await fetch(origin);
  assert.equal(homepage.status, 200);
  assert.match(await homepage.text(), /Save demo enquiry/);

  const adminPage = await fetch(origin + '/admin');
  assert.equal(adminPage.status, 200);

  const denied = await fetch(origin + '/api/enquiries');
  assert.equal(denied.status, 401);

  const requestKey = crypto.randomUUID();
  const payload = {
    name: 'HTTP Demo Reviewer',
    email: 'http-demo@example.com',
    organisation: 'Example Evaluation Lab',
    intent: 'Technical discussion',
    material: 'GO',
    message: 'Fictional HTTP demonstration for a coating evaluation project.',
    demoConsent: true,
    website: '',
    requestKey,
  };
  const post = await fetch(origin + '/api/enquiries', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal(post.status, 201);
  const receipt = await post.json();

  const retrieved = await fetch(origin + '/api/enquiries?q=' + receipt.id, {
    headers: { Authorization: 'Bearer ' + key },
  });
  assert.equal(retrieved.status, 200);
  const records = await retrieved.json();
  assert.equal(records.enquiries[0].id, receipt.id);
  assert.equal(records.enquiries[0].message, payload.message);

  const updated = await fetch(origin + '/api/enquiries/' + receipt.id, {
    method: 'PATCH',
    headers: { Origin: origin, 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({ status: 'in_progress', revision: 0 }),
  });
  assert.equal(updated.status, 200);

  console.log(JSON.stringify({
    homepage: homepage.status,
    adminPage: adminPage.status,
    unauthorizedList: denied.status,
    write: post.status,
    read: retrieved.status,
    update: updated.status,
    reference: receipt.id,
    record: records.enquiries[0],
  }, null, 2));
} finally {
  child.kill();
}
