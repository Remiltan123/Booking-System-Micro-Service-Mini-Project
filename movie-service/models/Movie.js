const mongoose = require("mongoose");

// Each seat: { seatNumber: "A1", isBooked: false }
const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  isBooked:   { type: Boolean, default: false },
});

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    genre: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    duration: {
      // in minutes
      type: Number,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    posterUrl: {
      type: String,
      default: "",
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 50,
    },
    seats: [seatSchema],
  },
  { timestamps: true }
);

// Auto-generate seats when a movie is created
movieSchema.pre("save", function (next) {
  if (this.isNew && this.seats.length === 0) {
    const rows = ["A", "B", "C", "D", "E"];
    const cols = 10;
    const seats = [];
    for (const row of rows) {
      for (let col = 1; col <= cols; col++) {
        seats.push({ seatNumber: `${row}${col}`, isBooked: false });
      }
    }
    this.seats = seats;
    this.totalSeats = seats.length;
  }
  next();
});

module.exports = mongoose.model("Movie", movieSchema);
