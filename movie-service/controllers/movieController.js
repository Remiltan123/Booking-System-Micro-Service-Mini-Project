const Movie = require("../models/Movie");
const { getChannel } = require("../config/rabbitmq");

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({ success: true, count: movies.length, data: movies });
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
