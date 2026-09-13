const amqp = require('amqplib');

let channel;

async function connect() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');

    conn.on('error', (err) => {
      console.error('[Payment/RabbitMQ] connection error:', err.message);
    });
    conn.on('close', () => {
      console.warn('[Payment/RabbitMQ] connection closed — reconnecting in 5s');
      setTimeout(connect, 5000);
    });

    channel = await conn.createChannel();
    await channel.assertExchange('app.events', 'topic', { durable: true });
    console.log('[Payment/RabbitMQ] connected');
    return channel;
  } catch (err) {
    console.error('[Payment/RabbitMQ] failed to connect:', err.message);
    console.log('[Payment/RabbitMQ] retrying in 5s...');
    setTimeout(connect, 5000);
  }
}

function getChannel() {
  if (!channel) throw new Error('[Payment/RabbitMQ] channel not ready');
  return channel;
}

module.exports = { connect, getChannel };
