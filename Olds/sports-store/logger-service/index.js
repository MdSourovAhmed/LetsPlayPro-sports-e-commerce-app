require("dotenv").config();
const mongoose = require("mongoose");
const { connect: connectRabbit } = require("./rabbitmq/connection");
const { createLogger } = require("./transports/winstonLogger");
const { startConsuming } = require("./consumers/loggerConsumer");
const fs = require("fs");

// Ensure log directory exists inside container
const LOG_DIR = "/var/log/sports-store";
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Logger Service: MongoDB connected");

    const logger = createLogger(process.env.MONGO_URI);

    await connectRabbit();
    await startConsuming(logger);

    logger.info("Logger Service fully started");
  } catch (err) {
    console.error("Logger Service startup failed:", err.message);
    process.exit(1);
  }
}

start();