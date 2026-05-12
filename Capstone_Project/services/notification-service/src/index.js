const { createApp } = require('./app');
const { initDb } = require('./db');
const { startConsumers } = require('./rabbit');

const port = Number(process.env.PORT || 3001);

async function main() {
  await initDb();
  startConsumers().catch(error => console.error('RabbitMQ consumer startup failed', error));
  createApp().listen(port, () => console.log('notification-service listening on ' + port));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

