const { notificationFromEvent } = require('../src/rabbit');

test('low stock events map to alert notifications', () => {
  const notification = notificationFromEvent('inventory.low_stock_detected', { sku: 'SKU-1', name: 'Cable', quantity: 3 });
  expect(notification.type).toBe('LOW_STOCK');
});

