const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const config = require('../config');
const { safeUsername } = require('../utils/security');
const { recordFailure, clearClientFailures } = require('../services/bruteForceService');
const { logEvent } = require('../services/auditService');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    logEvent({ eventType: 'RATE_LIMIT', severity: 'MEDIUM', ipHash: req.ipHash, detail: 'Login rate limit exceeded' });
    res.status(429).render('login', { error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.', expired: false });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null, expired: req.query.expired === '1' });
});

router.post('/login', loginLimiter, async (req, res) => {
  const username = safeUsername(req.body.username);
  const password = String(req.body.password || '');

  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username) || password.length < 8 || password.length > 128) {
    recordFailure(req.ipHash, username);
    logEvent({ eventType: 'LOGIN_FAILURE', severity: 'MEDIUM', ipHash: req.ipHash, username, detail: 'Input validation failed' });
    return res.status(400).render('login', { error: '아이디 또는 비밀번호 형식이 올바르지 않습니다.', expired: false });
  }

  const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
  const ok = user ? await bcrypt.compare(password, user.password_hash) : false;

  if (!ok) {
    const failures = recordFailure(req.ipHash, username);
    logEvent({ eventType: 'LOGIN_FAILURE', severity: failures >= 3 ? 'HIGH' : 'MEDIUM', ipHash: req.ipHash, username, detail: `Failed login count in window: ${failures}` });
    return res.status(401).render('login', { error: '아이디 또는 비밀번호가 올바르지 않습니다.', expired: false });
  }

  clearClientFailures(req.ipHash);
  logEvent({ eventType: 'LOGIN_SUCCESS', severity: 'INFO', ipHash: req.ipHash, username });

  const token = jwt.sign({ sub: user.id, username: user.username }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.nodeEnv === 'production',
    maxAge: 30 * 60 * 1000
  });
  return res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
  res.clearCookie(config.cookieName, { httpOnly: true, sameSite: 'strict', secure: config.nodeEnv === 'production' });
  res.redirect('/login');
});

module.exports = router;
