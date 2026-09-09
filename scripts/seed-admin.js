const bcrypt = require('bcryptjs');
const db = require('../src/db');
require('dotenv').config();

(async () => {
  const username = String(process.env.ADMIN_USERNAME || '').trim();
  const password = String(process.env.ADMIN_PASSWORD || '');

  if (!username || password.length < 10) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD (10+ chars) in .env first.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  db.prepare(`
    INSERT INTO users(username, password_hash)
    VALUES (?, ?)
    ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
  `).run(username, hash);

  console.log(`Admin user '${username}' is ready.`);
})();
