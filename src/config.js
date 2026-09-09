const path = require('path');
require('dotenv').config();

const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me-please-32chars',
  ipHashSalt: process.env.IP_HASH_SALT || 'dev-only-ip-salt-change-me',
  dbPath: path.join(__dirname, '..', 'data', 'security.db'),
  cookieName: 'ssg_token',
  jwtExpiresIn: '30m',
  bruteForce: {
    maxFailures: 5,
    windowMinutes: 10,
    blockMinutes: 15
  }
};

module.exports = config;
