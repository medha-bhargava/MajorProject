const amqp = require('amqplib');
const { saveNotification } = require('./db');
const { sendOperationalEmail } = require('./mailer');

const EXCHANGE = 'smart.inventory.events';
const bindings = [
  { queue: 'notification.low_stock', key: 'inventory.low_stock_detected' },
  { queue: 'notification.procurement', key: 'procurement.*' },
  { queue: 'notification.shipment', key: 'shipment.delivered' }
];

function notificationFromEvent(routingKey, payload) {
  if (routingKey === 'inventory.low_stock_detected') {
    return { type: 'LOW_STOCK', title: 'Low stock detected', message: (payload.name || payload.sku) + ' is at ' + payload.quantity + ' units', payload };
  }
  if (routingKey === 'procurement.approved') {
    return { type: 'PROCUREMENT_APPROVED', title: 'Procurement approved', message: 'Purchase order ' + payload.orderId + ' was approved', payload };
  }
  if (routingKey === 'procurement.completed') {
    return { type: 'PROCUREMENT_COMPLETED', title: 'Procurement completed', message: 'Received ' + payload.quantity + ' units for ' + payload.sku, payload };
  }
  if (routingKey === 'shipment.delivered') {
    return { type: 'SHIPMENT_DELIVERED', title: 'Shipment delivered', message: 'Shipment ' + payload.trackingNumber + ' delivered', payload };
  }
  return { type: 'EVENT', title: routingKey, message: JSON.stringify(payload), payload };
}

async function startConsumers() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  for (const binding of bindings) {
    await channel.assertQueue(binding.queue, { durable: true });
    await channel.bindQueue(binding.queue, EXCHANGE, binding.key);
    await channel.consume(binding.queue, async message => {
      if (!message) return;
      try {
        const payload = JSON.parse(message.content.toString());
        const notification = notificationFromEvent(message.fields.routingKey, payload);
        await saveNotification(notification);
        await sendOperationalEmail(notification.title, notification.message).catch(() => undefined);
        channel.ack(message);
      } catch (error) {
        channel.nack(message, false, false);
      }
    });
  }
  return { connection, channel };
}

module.exports = { startConsumers, notificationFromEvent };

