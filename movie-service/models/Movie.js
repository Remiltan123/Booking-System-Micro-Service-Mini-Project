const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
