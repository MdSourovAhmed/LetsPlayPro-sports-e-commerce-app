const amqp = require('amqplib');

let channel;

async function connect() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');

    conn.on('error', (err) => console.error('[Product/RabbitMQ] error:', err.message));
    conn.on('close', () => {
      console.warn('[Product/RabbitMQ] connection closed — reconnecting in 5s');
      setTimeout(connect, 5000);
    });

    channel = await conn.createChannel();
    await channel.assertExchange('app.events', 'topic', { durable: true });
    console.log('[Product/RabbitMQ] connected');
    return channel;
  } catch (err) {
    console.error('[Product/RabbitMQ] failed to connect:', err.message);
    setTimeout(connect, 5000);
  }
}

function getChannel() {
  if (!channel) throw new Error('[Product/RabbitMQ] channel not ready');
  return channel;
}

module.exports = { connect, getChannel };
