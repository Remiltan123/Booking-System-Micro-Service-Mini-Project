const bookingConfirmationTemplate = ({ movieTitle, seatNumber, bookingId }) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Booking Confirmed</h2>
      <p>Your movie ticket booking has been confirmed.</p>
      <p><strong>Movie:</strong> ${movieTitle}</p>
      <p><strong>Seat:</strong> ${seatNumber}</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p>Enjoy the show!</p>
    </div>
  `;
};

module.exports = { bookingConfirmationTemplate };
