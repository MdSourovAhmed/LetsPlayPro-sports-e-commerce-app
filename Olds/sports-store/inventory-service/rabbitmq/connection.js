const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";
const EXCHANGE_NAME = "sports_store";
const EXCHANGE_TYPE = "topic";

let connection = null;
let channel = null;

async function connect(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

      connection.on("close", () => {
        console.warn("RabbitMQ connection closed. Reconnecting...");
        setTimeout(() => connect(), delay);
      });

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
      });

      console.log("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.error(`RabbitMQ connect attempt ${i + 1} failed: ${err.message}`);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Could not connect to RabbitMQ after maximum retries");
}

async function getChannel() {
  if (!channel) await connect();
  return channel;
}

async function publishEvent(routingKey, payload) {
  const ch = await getChannel();
  const message = JSON.stringify({ ...payload, timestamp: new Date().toISOString() });
  ch.publish(EXCHANGE_NAME, routingKey, Buffer.from(message), { persistent: true });
  console.log(`Published [${routingKey}]:`, payload.eventId || "");
}

async function consumeEvents(queueName, bindingKeys, handler) {
  const ch = await getChannel();
  await ch.assertQueue(queueName, { durable: true });

  for (const key of bindingKeys) {
    await ch.bindQueue(queueName, EXCHANGE_NAME, key);
  }

  ch.prefetch(1);
  ch.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload, msg.fields.routingKey);
      ch.ack(msg);
    } catch (err) {
      console.error("Error processing message:", err.message);
      ch.nack(msg, false, false);
    }
  });

  console.log(`Consuming queue [${queueName}] bound to: ${bindingKeys.join(", ")}`);
}

module.exports = { connect, getChannel, publishEvent, consumeEvents };