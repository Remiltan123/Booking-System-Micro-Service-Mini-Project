import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';

const MovieCard = ({ movie }) => {
  // Format date
  const releaseDate = new Date(movie.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Dummy poster if none provided
  const posterImg = movie.posterUrl || `https://via.placeholder.com/400x600/1e293b/8b5cf6?text=${encodeURIComponent(movie.title)}`;

  return (
    <Link to={`/movies/${movie._id}`} className="movie-card glass-panel">
      <img src={posterImg} alt={movie.title} className="movie-poster" />
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        
        <div className="movie-meta">
          <span><Clock size={14} /> {movie.duration} min</span>
          <span><Calendar size={14} /> {releaseDate}</span>
        </div>
        
        <div className="movie-tags" style={{ marginBottom: 0, marginTop: 'auto' }}>
          <span className="movie-tag">{movie.genre}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
