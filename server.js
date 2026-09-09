const app = require('./app');
const config = require('./src/config');

app.listen(config.port, () => {
  console.log(`Secure Server Guard running at http://localhost:${config.port}`);
});
