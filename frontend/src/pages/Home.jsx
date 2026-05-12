import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import MovieCard from '../components/MovieCard';
import { Film } from 'lucide-react';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await apiClient.get('/movie-service/api/movies');
        setMovies(response.data);
      } catch (err) {
        setError('Failed to load movies. Ensure services are running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="page-wrapper container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '30px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '15px' }}>
          Welcome to <span className="heading-gradient">TicketMaster</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Book tickets for the latest blockbusters with our seamless microservice-powered platform.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <Film size={24} color="var(--primary)" />
        <h2>Now Showing</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>Loading movies...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>No movies available at the moment.</div>
      ) : (
        <div className="movie-grid">
          {movies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
