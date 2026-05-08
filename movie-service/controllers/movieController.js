const Movie = require("../models/Movie");

// ─────────────────────────────────────────────
// GET /api/movies  — list all movies
// ─────────────────────────────────────────────
exports.getAllMovies = async (req, res) => {
  try {
    // Exclude the heavy seats array from the list view
    const movies = await Movie.find().select("-seats");
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/movies  — add a new movie (admin)
// ─────────────────────────────────────────────
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      posterUrl,
    } = req.body;

    if (!title || !genre || !duration || !releaseDate) {
      return res.status(400).json({
        message: "title, genre, duration and releaseDate are required",
      });
    }

    const movie = await Movie.create({
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      posterUrl,
    });

    res.status(201).json({
      message: "Movie created successfully",
      movie,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/movies/:id  — get single movie detail
// ─────────────────────────────────────────────
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).select("-seats");
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/movies/:id/seats  — get seat availability
// Called by Booking Service (inter-service communication)
// ─────────────────────────────────────────────
exports.getMovieSeats = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).select(
      "title seats totalSeats"
    );
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const availableSeats = movie.seats.filter((s) => !s.isBooked);
    const bookedSeats    = movie.seats.filter((s) => s.isBooked);

    res.status(200).json({
      movieId:        movie._id,
      title:          movie.title,
      totalSeats:     movie.totalSeats,
      availableCount: availableSeats.length,
      bookedCount:    bookedSeats.length,
      seats:          movie.seats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/movies/:id/seats/book
// Body: { seatNumber: "A1" }
// Called internally by Booking Service to mark a seat as booked
// ─────────────────────────────────────────────
exports.bookSeat = async (req, res) => {
  try {
    const { seatNumber } = req.body;
    if (!seatNumber) {
      return res.status(400).json({ message: "seatNumber is required" });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const seat = movie.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) {
      return res.status(404).json({ message: `Seat ${seatNumber} not found` });
    }
    if (seat.isBooked) {
      return res
        .status(409)
        .json({ message: `Seat ${seatNumber} is already booked` });
    }

    seat.isBooked = true;
    await movie.save();

    res.status(200).json({
      message: `Seat ${seatNumber} booked successfully`,
      seat,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/movies/:id/seats/release
// Body: { seatNumber: "A1" }
// Called by Booking Service when a booking is cancelled
// ─────────────────────────────────────────────
exports.releaseSeat = async (req, res) => {
  try {
    const { seatNumber } = req.body;
    if (!seatNumber) {
      return res.status(400).json({ message: "seatNumber is required" });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const seat = movie.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) {
      return res.status(404).json({ message: `Seat ${seatNumber} not found` });
    }

    seat.isBooked = false;
    await movie.save();

    res.status(200).json({
      message: `Seat ${seatNumber} released successfully`,
      seat,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/movies/:id  — update a movie (admin)
// ─────────────────────────────────────────────
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-seats");

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ message: "Movie updated successfully", movie });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/movies/:id  — delete a movie (admin)
// ─────────────────────────────────────────────
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
