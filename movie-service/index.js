const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const movieRoutes = require("./routes/movieRoutes");
const { connectRabbitMQ } = require("./config/rabbitmq");
const eurekaClient = require("./config/eureka-client");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/movies", movieRoutes);

// Health Check / Test Route
app.get("/api/movies/health", (req, res) => {
  res.json({
    status: "UP",
    service: "movie-service",
    timestamp: new Date(),
  });
});

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Movie Service Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// RabbitMQ and Server Start
const startServer = async () => {
  try {
    await connectDB();
    
    try {
        await connectRabbitMQ();
        console.log("RabbitMQ connection established");
    } catch (rmqError) {
        console.warn("RabbitMQ not available, continuing without it...");
    }

    app.listen(PORT, () => {
      console.log(`Movie Service running on port ${PORT}`);

      // Eureka Registration
      eurekaClient.start((error) => {
        if (error) {
          console.error("Eureka registration failed:", error);
        } else {
          console.log("Movie Service registered in Eureka");
        }
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
