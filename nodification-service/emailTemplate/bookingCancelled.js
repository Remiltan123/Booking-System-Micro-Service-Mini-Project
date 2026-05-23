const bookingCancelledTemplate = ({ movieTitle, seatNumber, bookingId }) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Booking Cancelled</h2>
      <p>Your movie ticket booking has been cancelled.</p>
      <p><strong>Movie:</strong> ${movieTitle}</p>
      <p><strong>Seat:</strong> ${seatNumber}</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
    </div>
  `;
};

module.exports = { bookingCancelledTemplate };
