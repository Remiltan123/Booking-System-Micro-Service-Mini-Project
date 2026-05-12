const mongoose = require("mongoose");

// Helper to generate a default seat map (e.g., 50 seats)
const generateSeats = () => {
  const seats = [];
  const rows = "ABCDEFGHIJ"; // 10 rows
  for (let row of rows) {
    for (let i = 1; i <= 5; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        isBooked: false,
      });
    }
  }
  return seats;
};

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a movie title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    genre: {
      type: String,
      required: [true, "Please add a genre"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Please add duration in minutes"],
    },
    releaseDate: {
      type: Date,
      required: [true, "Please add a release date"],
    },
    posterUrl: {
      type: String,
      default: "no-photo.jpg",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot be more than 10"],
    },
    showTime: {
      type: Date,
      required: [true, "Please add a show time"],
    },
    seats: {
      type: [
        {
          seatNumber: String,
          isBooked: { type: Boolean, default: false },
        },
      ],
      default: generateSeats,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
