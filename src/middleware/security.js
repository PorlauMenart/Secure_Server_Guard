const { hashIp } = require('../utils/security');
const { isBlocked } = require('../services/bruteForceService');
const { logEvent } = require('../services/auditService');

function blockGuard(req, res, next) {
  const ipHash = hashIp(req.ip);
  req.ipHash = ipHash;
  const block = isBlocked(ipHash);
  if (!block) return next();

  logEvent({
    eventType: 'BLOCKED_REQUEST',
    severity: 'HIGH',
    ipHash,
    detail: `Request denied until ${block.blocked_until}`
  });

  return res.status(403).render('blocked', {
    blockedUntil: block.blocked_until,
    reason: block.reason
  });
}

module.exports = { blockGuard };
