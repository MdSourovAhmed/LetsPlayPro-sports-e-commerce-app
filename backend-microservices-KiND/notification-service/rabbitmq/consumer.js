const amqp = require('amqplib');
const dotenv = require('dotenv');

dotenv.config();

const {
  handleOrderStatusUpdated,
  handleOrderCancelled,
  handleUserRegistered,
  handlePasswordResetRequested,
} = require('../handlers/eventHandlers');
const { messagesProcessed, messageProcessingDuration } = require('../utils/metrics');

const ROUTING_HANDLERS = {
  'order.status_updated': handleOrderStatusUpdated,
  'order.cancelled': handleOrderCancelled,
  'user.registered': handleUserRegistered,
  'user.password_reset_requested': handlePasswordResetRequested,
};

// Timestamp of the last successfully processed message (or connection time, if nothing has
// come through yet) — /health in index.js reports this so a monitoring dashboard can tell
// "process is up but the queue has gone quiet for an hour" from "actively consuming".
let lastActivity = null;

function getLastActivity() {
  return lastActivity;
}

async function startConsumer() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');

    conn.on('error', (err) => console.error('[Notification/RabbitMQ] error:', err.message));
    conn.on('close', () => {
      console.warn('[Notification/RabbitMQ] connection closed — reconnecting in 5s');
      setTimeout(startConsumer, 5000);
    });

    const ch = await conn.createChannel();
    await ch.assertExchange('app.events', 'topic', { durable: true });

    const { queue } = await ch.assertQueue('notification.queue', { durable: true });

    // Bind all routing keys this service cares about
    for (const key of Object.keys(ROUTING_HANDLERS)) {
      await ch.bindQueue(queue, 'app.events', key);
    }

    ch.prefetch(1);

    ch.consume(queue, async (msg) => {
      if (!msg) return;

      const routingKey = msg.fields.routingKey;
      const handler = ROUTING_HANDLERS[routingKey];
      const start = process.hrtime.bigint();

      try {
        const payload = JSON.parse(msg.content.toString());

        if (handler) {
          await handler(payload);
          messagesProcessed.inc({ routing_key: routingKey, outcome: 'success' });
        } else {
          console.warn(`[Notification] no handler for routing key: ${routingKey}`);
          messagesProcessed.inc({ routing_key: routingKey, outcome: 'unhandled' });
        }

        messageProcessingDuration.observe(
          { routing_key: routingKey },
          Number(process.hrtime.bigint() - start) / 1e9
        );

        ch.ack(msg);
        lastActivity = new Date().toISOString();
      } catch (err) {
        console.error(`[Notification] failed processing ${routingKey}:`, err.message);
        messagesProcessed.inc({ routing_key: routingKey, outcome: 'failure' });
        ch.nack(msg, false, false); // dead-letter without requeue
      }
    });

    console.log('[Notification] consumer ready — listening on notification.queue');
    lastActivity = new Date().toISOString();
  } catch (err) {
    console.error('[Notification/RabbitMQ] failed to start:', err.message);
    setTimeout(startConsumer, 5000);
  }
}

module.exports = { startConsumer, getLastActivity };
