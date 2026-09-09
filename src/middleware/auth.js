const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next) {
  const token = req.cookies[config.cookieName];
  if (!token) return res.redirect('/login');

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch (_) {
    res.clearCookie(config.cookieName);
    return res.redirect('/login?expired=1');
  }
}

module.exports = { requireAuth };
