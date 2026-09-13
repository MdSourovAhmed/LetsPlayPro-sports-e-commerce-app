require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { connect: connectRabbit } = require("./rabbitmq/connection");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Order Service: MongoDB connected");

    await connectRabbit();
    console.log("Order Service: RabbitMQ connected");

    const PORT = process.env.PORT || 9001;
    app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
  } catch (err) {
    console.error("Order Service startup failed:", err.message);
    process.exit(1);
  }
}

start();