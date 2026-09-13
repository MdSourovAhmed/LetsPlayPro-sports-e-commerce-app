require("dotenv").config();
const { connect: connectRabbit } = require("./rabbitmq/connection");
const { startConsuming } = require("./consumers/notificationConsumer");

async function start() {
  try {
    await connectRabbit();
    await startConsuming();
    console.log("Notification Service: listening for events");
  } catch (err) {
    console.error("Notification Service startup failed:", err.message);
    process.exit(1);
  }
}

start();