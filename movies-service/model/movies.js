const mongoose = require("mongoose");

const generateSeats = () => {
  const seats = [];

  const rows = "ABCDEFGHIJ";

  for (let row of rows) {
    for (let i = 1; i <= 5; i++) {
      seats.push({
        seatNumber: `${row}${i}`, 
        isBooked: false,
      });
    }
  }
  return seats;
};

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,

  showTime: Date,

  seats: {
    type: [
      {
        seatNumber: String,
        isBooked: { type: Boolean, default: false },
      },
    ],
    default: generateSeats,
  },
});

module.exports = mongoose.model("Movie", movieSchema);