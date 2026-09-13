require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { connect: connectRabbit } = require("./rabbitmq/connection");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Product Service: MongoDB connected");

    await connectRabbit();
    console.log("Product Service: RabbitMQ connected");

    const PORT = process.env.PORT || 9002;
    app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));
  } catch (err) {
    console.error("Product Service startup failed:", err.message);
    process.exit(1);
  }
}

start();