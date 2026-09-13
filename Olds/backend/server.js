const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const Product = require("./models/Product");

dotenv.config();

const app = express();
// app.use(cors());

app.use(
  cors({
    // origin: ["http://localhost:5173"], // Allow requests from Vite frontend
    origin: [
      process.env.FRONTEND_URL1,
      process.env.FRONTEND_URL2,
      process.env.FRONTEND_URL3,
      process.env.FRONTEND_URL4,
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
// app.use(cors());
app.use(express.json());

connectDB();

// ... other code ...
app.use("/api/client", require("./routes/userRoutes"));
app.use("/api/client", require("./routes/authRoutes"));
app.use("/api/client", require("./routes/clientRoutes"));
app.use("/api/client", require("./routes/orderRoutes"));


app.use("/api/admin", require("./routes/orderRoutes"));
app.use("/api/admin/", require("./routes/productRoute"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
