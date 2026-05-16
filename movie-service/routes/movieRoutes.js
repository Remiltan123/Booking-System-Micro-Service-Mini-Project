const express = require("express");

const {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  reserveSeats,
  getAvailableSeats,
  selectMovie,
} = require("../controllers/movieController");

const router = express.Router();

// ============================
// Movie CRUD Routes
// ============================

// Get all movies
router.get("/get-movies", getMovies);

// Get single movie by ID
router.get("/get-movie/:id", getMovie);

// Create movie
router.post("/create-movie", createMovie);

// Update movie
router.put("/update-movie/:id", updateMovie);

// Delete movie
router.delete("/delete-movie/:id", deleteMovie);


// Reserve seats
router.post("/reserve-seats", reserveSeats);

// Get available seats
router.get("/available-seats/:id", getAvailableSeats);

// ============================
// RabbitMQ Event Route
// ============================

// Select movie event
router.post("/select-movie", selectMovie);

module.exports = router;
