import { test } from 'node:test';
import assert from 'node:assert/strict';
import vercelHandler from '../api/index.js';

const origin = 'https://my-app.vercel.app';
const adminKey = 'oGdQoJ7iEDM8bwIrJT0zl0NcWm7DCjtg';

function mockReq(url, method = 'GET', headers = {}, body = null) {
  const reqHeaders = {
    host: 'my-app.vercel.app',
    'x-forwarded-proto': 'https',
    'x-forwarded-host': 'my-app.vercel.app',
    origin,
    ...headers,
  };
  return new Request(origin + url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : null,
  });
}

test('Vercel handler: health check endpoint', async () => {
  const req = mockReq('/api/health');
  const res = await vercelHandler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.database, 'connected');
});

test('Vercel handler: submit enquiry and retrieve via admin desk', async () => {
  const payload = {
    name: 'Vercel Test Reviewer',
    email: 'vercel-test@example.com',
    organisation: 'Vercel Deployment Labs',
    intent: 'Sample evaluation',
    material: 'FLG',
    message: 'Testing submission through Vercel serverless adapter.',
    demoConsent: true,
    website: '',
    requestKey: crypto.randomUUID(),
  };

  const createReq = mockReq('/api/enquiries', 'POST', { 'Content-Type': 'application/json' }, payload);
  const createRes = await vercelHandler(createReq);
  assert.equal(createRes.status, 201);
  const createData = await createRes.json();
  assert.ok(createData.id);

  // Unauthorized list
  const unauthReq = mockReq('/api/enquiries');
  const unauthRes = await vercelHandler(unauthReq);
  assert.equal(unauthRes.status, 401);

  // Authorized list
  const authReq = mockReq('/api/enquiries', 'GET', { Authorization: `Bearer ${adminKey}` });
  const authRes = await vercelHandler(authReq);
  assert.equal(authRes.status, 200);
  const listData = await authRes.json();
  assert.ok(listData.enquiries.some(e => e.id === createData.id));

  // Update status
  const updateReq = mockReq(`/api/enquiries/${createData.id}`, 'PATCH', {
    Authorization: `Bearer ${adminKey}`,
    'Content-Type': 'application/json',
  }, {
    status: 'in_progress',
    revision: 0,
  });
  const updateRes = await vercelHandler(updateReq);
  assert.equal(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.equal(updateData.enquiry.status, 'in_progress');
});

