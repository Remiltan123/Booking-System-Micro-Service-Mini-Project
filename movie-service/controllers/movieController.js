const Movie = require("../models/Movie");
const { getChannel } = require("../config/rabbitmq");

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const movies = await Movie.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Movie.countDocuments();

    res.status(200).json({
      success: true,
      totalMovies: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: movies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private (Admin role assumed)
exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);

    // Optional: Send event to RabbitMQ
    const channel = getChannel();
    if (channel) {
        const queue = "movie_events_queue";
        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify({ type: "MOVIE_CREATED", data: movie })));
    }

    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid data", error: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private
exports.updateMovie = async (req, res) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error updating movie", error: error.message });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {}, message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Reserve seats for a movie
// @route   POST /api/movies/reserve-seats
// @access  Public
exports.reserveSeats = async (req, res) => {
  try {
    const { movieId, seats } = req.body;

    if (!movieId || !seats || seats.length === 0) {
      return res.status(400).json({ success: false, message: "movieId and seats are required" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // Check if seats exist and are available
    for (let seatNumber of seats) {
      const seat = movie.seats.find((s) => s.seatNumber === seatNumber);

      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatNumber} does not exist` });
      }

      if (seat.isBooked) {
        return res.status(400).json({ success: false, message: `Seat ${seatNumber} is already booked` });
      }
    }

    // Mark seats as booked
    movie.seats.forEach((s) => {
      if (seats.includes(s.seatNumber)) {
        s.isBooked = true;
      }
    });

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Seats reserved successfully",
      reservedSeats: seats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Release reserved seats for a movie
// @route   POST /api/movies/release-seats
// @access  Public
exports.releaseSeats = async (req, res) => {
  try {
    const { movieId, seats } = req.body;

    if (!movieId || !seats || seats.length === 0) {
      return res.status(400).json({ success: false, message: "movieId and seats are required" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    for (let seatNumber of seats) {
      const seat = movie.seats.find((s) => s.seatNumber === seatNumber);

      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatNumber} does not exist` });
      }

      if (!seat.isBooked) {
        return res.status(400).json({ success: false, message: `Seat ${seatNumber} is not currently booked` });
      }
    }

    movie.seats.forEach((s) => {
      if (seats.includes(s.seatNumber)) {
        s.isBooked = false;
      }
    });

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Seats released successfully",
      releasedSeats: seats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get available seats for a movie
// @route   GET /api/movies/available-seats/:id
// @access  Public
exports.getAvailableSeats = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const availableSeats = movie.seats.filter((seat) => !seat.isBooked);

    res.status(200).json({
      success: true,
      totalSeats: movie.seats.length,
      availableCount: availableSeats.length,
      data: availableSeats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Select movie and notify via RabbitMQ
// @route   POST /api/movies/select-movie
// @access  Public
exports.selectMovie = async (req, res) => {
  try {
    const { movieId } = req.body;
    const channel = getChannel();

    if (!channel) {
      return res.status(500).json({ success: false, message: "RabbitMQ channel not available" });
    }

    const exchange = "movie_exchange";
    await channel.assertExchange(exchange, "fanout", { durable: false });

    const message = {
      movieId,
      action: "MOVIE_SELECTED",
      timestamp: new Date(),
    };

    channel.publish(exchange, "", Buffer.from(JSON.stringify(message)));

    res.status(200).json({ success: true, message: "Movie selection event sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send event", error: error.message });
  }
};
