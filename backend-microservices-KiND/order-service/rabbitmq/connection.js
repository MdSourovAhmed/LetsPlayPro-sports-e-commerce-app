const amqp = require('amqplib');

let channel;

async function connect() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');

    conn.on('error', (err) => console.error('[Order/RabbitMQ] error:', err.message));
    conn.on('close', () => {
      console.warn('[Order/RabbitMQ] connection closed — reconnecting in 5s');
      channel = null;
      setTimeout(connect, 5000);
    });

    channel = await conn.createChannel();
    await channel.assertExchange('app.events', 'topic', { durable: true });
    console.log('[Order/RabbitMQ] connected');
    return channel;
  } catch (err) {
    console.error('[Order/RabbitMQ] failed to connect:', err.message);
    setTimeout(connect, 5000);
  }
}

function getChannel() {
  if (!channel) throw new Error('[Order/RabbitMQ] channel not ready');
  return channel;
}

module.exports = { connect, getChannel };
