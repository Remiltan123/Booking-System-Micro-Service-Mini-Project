const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || "http://localhost:5002";

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
    posterUrl: "https://m.media-amazon.com/images/I/81hSzM5WQYL._AC_UF1000,1000_QL80_.jpg",
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

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${MOVIE_SERVICE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

const seedMovies = async () => {
  const existingMoviesResponse = await requestJson("/api/movies/get-movies?limit=100");
  const existingTitles = new Set((existingMoviesResponse.data || []).map((movie) => movie.title));
  let insertedCount = 0;

  for (const movie of movies) {
    if (existingTitles.has(movie.title)) {
      continue;
    }

    await requestJson("/api/movies/create-movie", {
      method: "POST",
      body: JSON.stringify(movie),
    });

    insertedCount += 1;
  }

  console.log(`Movie API seed complete. Inserted ${insertedCount} new movie(s).`);
};

seedMovies().catch((error) => {
  console.error("Movie API seed failed:", error.message);
  process.exit(1);
});
