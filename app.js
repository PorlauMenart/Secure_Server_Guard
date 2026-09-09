const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const config = require('./src/config');
require('./src/db');
const { blockGuard } = require('./src/middleware/security');
const { logEvent } = require('./src/services/auditService');
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:']
    }
  },
  hsts: config.nodeEnv === 'production' ? undefined : false
}));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    logEvent({ eventType: 'RATE_LIMIT', severity: 'MEDIUM', ipHash: req.ipHash || null, detail: 'Global rate limit exceeded' });
    res.status(429).send('Too many requests');
  }
});

app.use(blockGuard);
app.use(globalLimiter);
app.use(authRoutes);
app.use(dashboardRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => res.status(404).render('404'));

module.exports = app;
