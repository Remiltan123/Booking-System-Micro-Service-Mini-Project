const express = require("express");
const router = express.Router();
const {createMovie,getMovie,updateMovie,deleteMovie,reserveSeats,getAvailableSeats, getAllMovies, selectMovie} = require ("../controllers/moviecontrollers");


router.post("/create-movie", createMovie);
router.get("/", getAllMovies);
router.get("/get-movie/:id", getMovie);
router.put("/update-movie/:id", updateMovie);
router.delete("/delete-movie/:id", deleteMovie);
router.post("/reserve-seats", reserveSeats);
router.get("/available-seats/:id", getAvailableSeats);
router.post("/select-movie", selectMovie); // for publishing selected movie details to RabbitMQ

module.exports = router;