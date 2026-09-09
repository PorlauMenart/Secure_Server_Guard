const db = require('../db');

const insertLog = db.prepare(`
  INSERT INTO audit_logs(event_type, severity, ip_hash, username, detail)
  VALUES (?, ?, ?, ?, ?)
`);

function logEvent({ eventType, severity = 'INFO', ipHash = null, username = null, detail = null }) {
  insertLog.run(eventType, severity, ipHash, username, detail);
}

function getRecentLogs(limit = 30) {
  return db.prepare(`
    SELECT id, event_type, severity, ip_hash, username, detail, created_at
    FROM audit_logs
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);
}

function getStats() {
  const rows = db.prepare(`
    SELECT event_type, COUNT(*) AS count
    FROM audit_logs
    GROUP BY event_type
  `).all();
  const result = Object.fromEntries(rows.map(r => [r.event_type, r.count]));
  return {
    loginSuccess: result.LOGIN_SUCCESS || 0,
    loginFailure: result.LOGIN_FAILURE || 0,
    blockedRequest: result.BLOCKED_REQUEST || 0,
    rateLimited: result.RATE_LIMIT || 0
  };
}

module.exports = { logEvent, getRecentLogs, getStats };
