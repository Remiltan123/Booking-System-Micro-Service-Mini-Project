const express    = require("express");
const mongoose   = require("mongoose");
const dotenv     = require("dotenv");
const cors       = require("cors");
const movieRoutes    = require("./routes/movieRoutes");
const { connectRabbitMQ } = require("./config/rabbitmq");
const eurekaClient        = require("./config/eureka-client");

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5002;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use("/api/movies", movieRoutes);

// Health-check (useful for Eureka)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "movie-service", port: PORT });
});

// ── Database ─────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Movie Service DB connected successfully");
  } catch (error) {
    console.error("DB connection error:", error.message);
  }
};

// ── RabbitMQ ─────────────────────────────────────────────────
const connectRabbitMQAndStart = async () => {
  try {
    await connectRabbitMQ();
    console.log("Movie Service connected to RabbitMQ successfully");
  } catch (error) {
    console.error("RabbitMQ connection failed:", error.message);
  }
};

// ── Bootstrap ────────────────────────────────────────────────
connectDB();
connectRabbitMQAndStart();

app.listen(PORT, () => {
  console.log(`Movie Service running on port ${PORT}`);

  // Register with Eureka Discovery Server
  eurekaClient.start((error) => {
    if (error) {
      console.log("Eureka registration failed:", error);
    } else {
      console.log("Movie Service registered in Eureka");
    }
  });
});
