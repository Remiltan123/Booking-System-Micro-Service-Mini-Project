const express = require("express");
const router  = express.Router();

const {
  getAllMovies,
  createMovie,
  getMovieById,
  getMovieSeats,
  bookSeat,
  releaseSeat,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const protect = require("../middleware/authMiddleware");

// ── Public routes ──────────────────────────────────────────
// GET  /api/movies          — list all movies
router.get("/", getAllMovies);

// GET  /api/movies/:id      — single movie detail
router.get("/:id", getMovieById);

// GET  /api/movies/:id/seats  — seat availability (used by Booking Service)
router.get("/:id/seats", getMovieSeats);

// ── Inter-service routes (called by Booking Service) ───────
// PATCH /api/movies/:id/seats/book    — mark seat as booked
router.patch("/:id/seats/book", bookSeat);

// PATCH /api/movies/:id/seats/release — release a seat on cancellation
router.patch("/:id/seats/release", releaseSeat);

// ── Protected routes (require JWT — admin actions) ─────────
// POST   /api/movies        — add a new movie
router.post("/", protect, createMovie);

// PUT    /api/movies/:id    — update movie details
router.put("/:id", protect, updateMovie);

// DELETE /api/movies/:id    — delete a movie
router.delete("/:id", protect, deleteMovie);

module.exports = router;
