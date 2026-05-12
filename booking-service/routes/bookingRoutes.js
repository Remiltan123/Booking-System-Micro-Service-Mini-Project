const express = require("express");
const router  = express.Router();
const {
  createBooking,
  getBookingById,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");

// All booking routes require authentication
router.use(protect);

// POST   /api/bookings       — create a new booking
router.post("/", createBooking);

// GET    /api/bookings/my    — get all bookings for the logged-in user
// NOTE: /my MUST come before /:id so Express doesn't treat "my" as an ID
router.get("/my", getMyBookings);

// GET    /api/bookings/:id   — get a single booking by ID
router.get("/:id", getBookingById);

// DELETE /api/bookings/:id   — cancel a booking
router.delete("/:id", cancelBooking);

module.exports = router;
