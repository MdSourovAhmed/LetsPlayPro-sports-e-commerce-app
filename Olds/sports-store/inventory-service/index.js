require("dotenv").config();
const mongoose = require("mongoose");
const { connect: connectRabbit } = require("./rabbitmq/connection");
const { startConsuming } = require("./consumers/inventoryConsumer");

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Inventory Service: MongoDB connected");

    await connectRabbit();
    await startConsuming();
    console.log("Inventory Service: listening for events");
  } catch (err) {
    console.error("Inventory Service startup failed:", err.message);
    process.exit(1);
  }
}

start();