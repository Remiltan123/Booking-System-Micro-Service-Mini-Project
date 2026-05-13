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

router.route("/").get(getMovies).post(createMovie);
router.route("/:id").get(getMovie).put(updateMovie).delete(deleteMovie);

// New Routes
router.post("/reserve-seats", reserveSeats);
router.get("/available-seats/:id", getAvailableSeats);
router.post("/select-movie", selectMovie);

module.exports = router;
