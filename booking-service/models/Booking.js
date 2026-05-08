const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // ID from User Service (no direct DB link — service-to-service only)
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    movieId: {
      type: String, // ID from Movie Service
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    // TODO (inter-service): totalPrice can be enriched from Movie Service later
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
