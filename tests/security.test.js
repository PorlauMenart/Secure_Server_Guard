process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-tests';
process.env.IP_HASH_SALT = 'test-ip-hash-salt';
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

test('health endpoint works', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('security headers are enabled', async () => {
  const res = await request(app).get('/login');
  assert.equal(res.status, 200);
  assert.ok(res.headers['x-content-type-options']);
  assert.ok(res.headers['content-security-policy']);
});

test('dashboard requires authentication', async () => {
  const res = await request(app).get('/dashboard');
  assert.equal(res.status, 302);
  assert.equal(res.headers.location, '/login');
});
