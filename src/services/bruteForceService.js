const db = require('../db');
const config = require('../config');
const { logEvent } = require('./auditService');

const insertFailure = db.prepare(`
  INSERT INTO auth_failures(ip_hash, username) VALUES (?, ?)
`);
const deleteOldFailures = db.prepare(`
  DELETE FROM auth_failures WHERE created_at < datetime('now', ?)
`);
const countFailures = db.prepare(`
  SELECT COUNT(*) AS count
  FROM auth_failures
  WHERE ip_hash = ? AND created_at >= datetime('now', ?)
`);
const getBlock = db.prepare(`
  SELECT ip_hash, blocked_until, reason
  FROM blocked_clients
  WHERE ip_hash = ? AND blocked_until > datetime('now')
`);
const upsertBlock = db.prepare(`
  INSERT INTO blocked_clients(ip_hash, blocked_until, reason, updated_at)
  VALUES (?, datetime('now', ?), ?, datetime('now'))
  ON CONFLICT(ip_hash) DO UPDATE SET
    blocked_until = excluded.blocked_until,
    reason = excluded.reason,
    updated_at = datetime('now')
`);
const clearFailures = db.prepare(`DELETE FROM auth_failures WHERE ip_hash = ?`);

function windowModifier() {
  return `-${config.bruteForce.windowMinutes} minutes`;
}
function blockModifier() {
  return `+${config.bruteForce.blockMinutes} minutes`;
}

function isBlocked(ipHash) {
  return getBlock.get(ipHash) || null;
}

function recordFailure(ipHash, username) {
  deleteOldFailures.run(windowModifier());
  insertFailure.run(ipHash, username || null);
  const { count } = countFailures.get(ipHash, windowModifier());

  if (count >= config.bruteForce.maxFailures) {
    upsertBlock.run(
      ipHash,
      blockModifier(),
      `${count} failed logins within ${config.bruteForce.windowMinutes} minutes`
    );
    logEvent({
      eventType: 'CLIENT_BLOCKED',
      severity: 'HIGH',
      ipHash,
      username,
      detail: `Temporary ${config.bruteForce.blockMinutes}-minute block applied`
    });
  }
  return count;
}

function clearClientFailures(ipHash) {
  clearFailures.run(ipHash);
}

function getActiveBlocks() {
  return db.prepare(`
    SELECT ip_hash, blocked_until, reason
    FROM blocked_clients
    WHERE blocked_until > datetime('now')
    ORDER BY blocked_until DESC
  `).all();
}

module.exports = { isBlocked, recordFailure, clearClientFailures, getActiveBlocks };
