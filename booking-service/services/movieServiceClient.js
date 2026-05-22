const axios = require("axios");

const reserveSeats = async ({ movieId, seats }) => {
  const movieServiceUrl = process.env.MOVIE_SERVICE_URL || "http://localhost:5002";

  const response = await axios.post(`${movieServiceUrl}/api/movies/reserve-seats`, {
    movieId,
    seats,
  });

  return response.data;
};

const releaseSeats = async ({ movieId, seats }) => {
  const movieServiceUrl = process.env.MOVIE_SERVICE_URL || "http://localhost:5002";

  const response = await axios.post(`${movieServiceUrl}/api/movies/release-seats`, {
    movieId,
    seats,
  });

  return response.data;
};

module.exports = { reserveSeats, releaseSeats };
