const Movie = require("../model/movies");
const { getChannel } = require("../config/rabbitmq");


// Create movie
exports.createMovie = async (req, res) => {
    try {
        const { title, description, showTime } = req.body;
        if (!title || !showTime) {
            return res.status(400).json({
                message: "Title and showTime are required",
            });
        }

        const movie = new Movie({
            title,
            description,
            showTime,
        });

        const savedMovie = await movie.save();

        res.status(201).json({
            message: "Movie created successfully",
            data: savedMovie,
        });
    } catch (error) {
        console.error("Create Movie Error:", error);
        res.status(500).json({
            message: "Server error while creating movie",
            error: error.message,
        });
    }
};


// Get movie by ID
exports.getMovie = async (req, res) => {
    try {
        const movieId = req.params.id;

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        res.status(200).json({
            message: "Movie fetched successfully",
            data: movie,
        });
    } catch (error) {
        console.error("Get Movie Error:", error);
        res.status(500).json({
            message: "Server error while fetching movie",
            error: error.message,
        });
    }
};


// Check & reserve seats
exports.reserveSeats = async (req, res) => {
    try {
        const { movieId, seats } = req.body;

        if (!movieId || !seats || seats.length === 0) {
            return res.status(400).json({
                message: "movieId and seats are required",
            });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        for (let seat of seats) {
            const found = movie.seats.find((s) => s.seatNumber === seat);

            if (!found) {
                return res.status(400).json({
                    message: `Seat ${seat} does not exist`,
                });
            }

            if (found.isBooked) {
                return res.status(400).json({
                    message: `Seat ${seat} is already booked`,
                });
            }
        }


        movie.seats.forEach((s) => {
            if (seats.includes(s.seatNumber)) {
                s.isBooked = true;
            }
        });

        await movie.save();

        res.status(200).json({
            message: "Seats reserved successfully",
            reservedSeats: seats,
        });

    } catch (error) {
        console.error("Reserve Seats Error:", error);
        res.status(500).json({
            message: "Server error while reserving seats",
            error: error.message,
        });
    }
};

// Update movie
exports.updateMovie = async (req, res) => {
    try {
        const movieId = req.params.id;
        const { title, description, showTime } = req.body;

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        // update only if provided
        if (title) movie.title = title;
        if (description) movie.description = description;
        if (showTime) movie.showTime = showTime;

        const updatedMovie = await movie.save();

        res.status(200).json({
            message: "Movie updated successfully",
            data: updatedMovie,
        });
    } catch (error) {
        console.error("Update Movie Error:", error);
        res.status(500).json({
            message: "Server error while updating movie",
            error: error.message,
        });
    }
};

// Delete movie
exports.deleteMovie = async (req, res) => {
    try {
        const movieId = req.params.id;

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        await Movie.findByIdAndDelete(movieId);

        res.status(200).json({
            message: "Movie deleted successfully",
            deletedMovieId: movieId,
        });
    } catch (error) {
        console.error("Delete Movie Error:", error);
        res.status(500).json({
            message: "Server error while deleting movie",
            error: error.message,
        });
    }
};


//get all movies with pagination
exports.getAllMovies = async (req, res) => {
    try {

        const { page = 1, limit = 10 } = req.query;

        const movies = await Movie.find()
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Movie.countDocuments();

        res.status(200).json({
            message: "Movies fetched successfully",
            totalMovies: total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            data: movies,
        });
    } catch (error) {
        console.error("Get All Movies Error:", error);

        res.status(500).json({
            message: "Server error while fetching movies",
            error: error.message,
        });
    }
};


//get available seats for a movie
exports.getAvailableSeats = async (req, res) => {
    try {
        const movieId = req.params.id;

        // validate
        if (!movieId) {
            return res.status(400).json({
                message: "Movie ID is required",
            });
        }

        const movie = await Movie.findById(movieId);

        // check movie exists
        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        // filter available seats
        const availableSeats = movie.seats.filter(
            (seat) => !seat.isBooked
        );

        res.status(200).json({
            message: "Available seats fetched successfully",
            totalSeats: movie.seats.length,
            availableCount: availableSeats.length,
            data: availableSeats,
        });
    } catch (error) {
        console.error("Get Available Seats Error:", error);

        res.status(500).json({
            message: "Server error while fetching available seats",
            error: error.message,
        });
    }
};


exports.selectMovie = async (req, res) => {
  try {
    const { movieId } = req.body;

    const channel = getChannel();

    const exchange = "movie_exchange";

    await channel.assertExchange(exchange, "fanout", {
      durable: false,
    });

    const message = {
      movieId,
      action: "MOVIE_SELECTED",
      timestamp: new Date(),
    };

    channel.publish(
      exchange,
      "",
      Buffer.from(JSON.stringify(message))
    );

    res.status(200).json({
      message: "Movie selection event sent",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send event",
      error: error.message,
    });
  }
};