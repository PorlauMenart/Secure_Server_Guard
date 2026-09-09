const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getRecentLogs, getStats } = require('../services/auditService');
const { getActiveBlocks } = require('../services/bruteForceService');
const { shortHash } = require('../utils/security');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/dashboard', requireAuth, (req, res) => {
  const logs = getRecentLogs(40).map(row => ({ ...row, ip_display: shortHash(row.ip_hash) }));
  const blocks = getActiveBlocks().map(row => ({ ...row, ip_display: shortHash(row.ip_hash) }));
  res.render('dashboard', {
    user: req.user,
    stats: getStats(),
    logs,
    blocks
  });
});

module.exports = router;
