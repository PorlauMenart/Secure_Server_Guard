const crypto = require('crypto');
const config = require('../config');

function normalizeIp(ip) {
  if (!ip) return 'unknown';
  return String(ip).replace(/^::ffff:/, '');
}

function hashIp(ip) {
  return crypto
    .createHmac('sha256', config.ipHashSalt)
    .update(normalizeIp(ip))
    .digest('hex');
}

function shortHash(value) {
  return value ? `${value.slice(0, 12)}…` : '-';
}

function safeUsername(value) {
  return String(value || '').trim().slice(0, 50);
}

module.exports = { normalizeIp, hashIp, shortHash, safeUsername };
