require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");

const app = express();
app.use(express.json());

// Routes are registered after start() so handlers close over the lazy-loaded modules
let schedulerModule = null;

app.put("/api/scheduler/interval", async (req, res) => {
  try {
    const { interval } = req.body;
    await schedulerModule.updateInterval(interval);
    res.json({ success: true, message: `Interval updated to ${interval}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post("/api/scheduler/run-now", async (req, res) => {
  try {
    schedulerModule.runReport(); // fire and forget
    res.json({ success: true, message: "Report generation started" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Scheduler Service: MongoDB connected");

    // Require scheduler AFTER mongoose is connected so models register cleanly
    schedulerModule = require("./jobs/scheduler");
    await schedulerModule.startScheduler();

    const PORT = process.env.PORT || 9005;
    app.listen(PORT, () => console.log(`Scheduler Service running on port ${PORT}`));
  } catch (err) {
    console.error("Scheduler Service startup failed:", err.message);
    process.exit(1);
  }
}

start();