const http = require('http');
const querystring = require('querystring');

const body = querystring.stringify({ username: 'admin', password: 'wrong-password' });
let count = 0;

function attempt() {
  count += 1;
  const req = http.request({
    hostname: '127.0.0.1', port: 3000, path: '/login', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, res => {
    console.log(`Attempt ${count}: HTTP ${res.statusCode}`);
    res.resume();
    if (count < 6) setTimeout(attempt, 300);
  });
  req.on('error', err => console.error('Start the server first:', err.message));
  req.write(body);
  req.end();
}

attempt();
