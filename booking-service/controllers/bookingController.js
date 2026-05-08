const Booking = require("../models/Booking");

// ──────────────────────────────────────────────────────
// POST /api/bookings
// Create a new booking
// Body: { movieId, movieTitle, seatNumber, userEmail }
// Protected: requires JWT (userId comes from token)
//
// TODO (Inter-service - Phase 2):
//   1. Call Movie Service GET /api/movies/:movieId/seats
//      to verify the seat exists and is NOT already booked.
//   2. Call Movie Service PATCH /api/movies/:movieId/seats/book
//      to mark the seat as booked in Movie DB.
//   3. Publish to RabbitMQ "booking_confirmation_queue"
//      so Notification Service sends a confirmation email.
// ──────────────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { movieId, movieTitle, seatNumber, userEmail } = req.body;
    const userId = req.user.id; // from JWT

    if (!movieId || !movieTitle || !seatNumber || !userEmail) {
      return res.status(400).json({
        message: "movieId, movieTitle, seatNumber and userEmail are required",
      });
    }

    // Check if this seat is already booked in Booking DB
    const existingBooking = await Booking.findOne({
      movieId,
      seatNumber,
      status: "CONFIRMED",
    });

    if (existingBooking) {
      return res.status(409).json({
        message: `Seat ${seatNumber} for this movie is already booked`,
      });
    }

    const booking = await Booking.create({
      userId,
      userEmail,
      movieId,
      movieTitle,
      seatNumber,
    });

    res.status(201).json({
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// GET /api/bookings/:id
// Get a single booking by its ID (must belong to the requesting user)
// ──────────────────────────────────────────────────────
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure users can only view their own bookings
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// GET /api/bookings/my
// Get all bookings for the currently logged-in user
// ──────────────────────────────────────────────────────
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// DELETE /api/bookings/:id
// Cancel a booking (sets status to CANCELLED)
//
// TODO (Inter-service - Phase 2):
//   Call Movie Service PATCH /api/movies/:movieId/seats/release
//   to free up the seat when a booking is cancelled.
// ──────────────────────────────────────────────────────
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
