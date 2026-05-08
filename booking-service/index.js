const express    = require("express");
const mongoose   = require("mongoose");
const dotenv     = require("dotenv");
const cors       = require("cors");
const bookingRoutes   = require("./routes/bookingRoutes");
const { connectRabbitMQ } = require("./config/rabbitmq");
const eurekaClient        = require("./config/eureka-client");

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5003;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use("/api/bookings", bookingRoutes);

// Health-check for Eureka
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "booking-service", port: PORT });
});

// ── Database ─────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Booking Service DB connected successfully");
  } catch (error) {
    console.error("DB connection error:", error.message);
  }
};

// ── RabbitMQ ─────────────────────────────────────────────────
const connectRabbitMQAndStart = async () => {
  try {
    await connectRabbitMQ();
    console.log("Booking Service connected to RabbitMQ successfully");
  } catch (error) {
    console.error("RabbitMQ connection failed:", error.message);
    // Non-fatal: service can still run without RabbitMQ for now
  }
};

// ── Bootstrap ────────────────────────────────────────────────
connectDB();
connectRabbitMQAndStart();

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);

  eurekaClient.start((error) => {
    if (error) {
      console.log("Eureka registration failed:", error);
    } else {
      console.log("Booking Service registered in Eureka");
    }
  });
});
