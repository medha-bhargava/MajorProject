const db = require('../src/db');
jest.spyOn(db, 'listNotifications').mockResolvedValue([]);
jest.spyOn(db, 'markRead').mockResolvedValue({ id: 'n1', read_at: new Date().toISOString() });
const { createApp } = require('../src/app');

test('health endpoint is registered', () => {
  const app = createApp();
  const routes = app._router.stack
    .filter(layer => layer.route)
    .map(layer => Object.keys(layer.route.methods)[0].toUpperCase() + ' ' + layer.route.path);
  expect(routes).toContain('GET /health');
});
