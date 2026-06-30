const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");

dotenv.config();

const movies = [
  {
    title: "Inception",
    description:
      "A skilled thief enters people's dreams to steal secrets and faces one final job that could change everything.",
    genre: "Sci-Fi",
    duration: 148,
    releaseDate: "2010-07-16",
    showTime: "2026-05-23T18:30:00.000Z",
    posterUrl: "https://m.media-amazon.com/images/I/71uKM+LdgFL._AC_UF894,1000_QL80_.jpg",
    rating: 9,
  },
  {
    title: "Interstellar",
    description:
      "A group of explorers travels through a wormhole in search of a new home for humanity.",
    genre: "Adventure",
    duration: 169,
    releaseDate: "2014-11-07",
    showTime: "2026-05-23T20:00:00.000Z",
    posterUrl: "https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_UF1000,1000_QL80_.jpg",
    rating: 9,
  },
  {
    title: "The Dark Knight",
    description:
      "Batman faces a chaotic criminal mastermind who pushes Gotham City to the edge.",
    genre: "Action",
    duration: 152,
    releaseDate: "2008-07-18",
    showTime: "2026-05-24T19:00:00.000Z",
    posterUrl: "https://m.media-amazon.com/images/I/51K8ouYrHeL._AC_.jpg",
    rating: 9,
  },
  {
    title: "Dune: Part Two",
    description:
      "Paul Atreides unites with the Fremen while seeking revenge and confronting his destiny.",
    genre: "Sci-Fi",
    duration: 166,
    releaseDate: "2024-03-01",
    showTime: "2026-05-24T21:00:00.000Z",
    posterUrl: "https://placehold.co/500x750/1a1a2e/ffffff?text=Dune%3A+Part+Two",
    rating: 8,
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    description:
      "Miles Morales travels across the multiverse and meets a team of Spider-People.",
    genre: "Animation",
    duration: 140,
    releaseDate: "2023-06-02",
    showTime: "2026-05-25T17:30:00.000Z",
    posterUrl: "https://m.media-amazon.com/images/I/81F5PF9oHhL._AC_UF1000,1000_QL80_.jpg",
    rating: 9,
  },
];

const seedMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    let insertedCount = 0;

    for (const movie of movies) {
      const exists = await Movie.findOne({ title: movie.title });

      if (!exists) {
        await Movie.create(movie);
        insertedCount += 1;
      }
    }

    console.log(`Movie seed complete. Inserted ${insertedCount} new movie(s).`);
  } catch (error) {
    console.error("Movie seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedMovies();
