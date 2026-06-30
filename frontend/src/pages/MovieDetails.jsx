import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Clock, Calendar, Ticket, ChevronLeft } from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [movie, setMovie] = useState(null);
  const [seatsData, setSeatsData] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchMovieDetails = useCallback(async () => {
    const movieRes = await apiClient.get(`/movie-service/api/movies/get-movie/${id}`);
    const movieData = movieRes.data?.data;

    setMovie(movieData);
    setSeatsData({ seats: movieData?.seats || [] });
  }, [id]);

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        await fetchMovieDetails();
      } catch (err) {
        setError('Failed to load movie details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [fetchMovieDetails]);

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    if (selectedSeat === seat.seatNumber) {
      setSelectedSeat(null); // unselect
    } else {
      setSelectedSeat(seat.seatNumber);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!selectedSeat) return;

    setBookingLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiClient.post('/booking-service/api/bookings', {
        movieId: id,
        movieTitle: movie.title,
        seatNumber: selectedSeat,
        userEmail: user.email,
      });
      
      setMessage(`Successfully booked seat ${selectedSeat}!`);
      showToast(`Seat ${selectedSeat} booked successfully.`, 'success');
      setSelectedSeat(null);
      
      await fetchMovieDetails();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to book seat.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="container page-wrapper" style={{ textAlign: 'center' }}>Loading details...</div>;
  if (error && !movie) return <div className="container page-wrapper error-message">{error}</div>;
  if (!movie) return <div className="container page-wrapper">Movie not found.</div>;

  const releaseDate = new Date(movie.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const posterImg = movie.posterUrl || `https://via.placeholder.com/400x600/1e293b/8b5cf6?text=${encodeURIComponent(movie.title)}`;

  const rows = [...new Set((seatsData?.seats || []).map((seat) => seat.seatNumber.charAt(0)))];

  return (
    <div className="container page-wrapper animate-fade-in">
      <button className="btn btn-outline" style={{ marginBottom: '30px' }} onClick={() => navigate(-1)}>
        <ChevronLeft size={18} /> Back to Movies
      </button>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="movie-detail-layout">
        <div>
          <img src={posterImg} alt={movie.title} className="movie-detail-poster" />
        </div>
        
        <div className="movie-detail-info">
          <div className="movie-tags">
            <span className="movie-tag">{movie.genre}</span>
            <span className="movie-tag" style={{ background: 'rgba(236, 72, 153, 0.2)', color: 'var(--secondary)' }}>
              {movie.language}
            </span>
          </div>
          
          <h1 className="heading-gradient">{movie.title}</h1>
          
          <div className="movie-meta" style={{ fontSize: '1rem', margin: '20px 0', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
            <span><Clock size={16} /> {movie.duration} minutes</span>
            <span><Calendar size={16} /> {releaseDate}</span>
          </div>
          
          <p style={{ lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '40px' }}>
            {movie.description || "Experience this cinematic masterpiece in our state-of-the-art theaters. Book your tickets now for an unforgettable experience."}
          </p>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ticket size={20} color="var(--primary)" /> Select Your Seat
            </h3>

            {seatsData ? (
              <>
                <div className="screen-indicator">Screen</div>
                
                <div className="seats-container">
                  {rows.map(row => (
                    <div key={row} className="seat-row">
                      <div className="row-label">{row}</div>
                      {seatsData.seats.filter(s => s.seatNumber.startsWith(row)).map(seat => {
                        const isSelected = selectedSeat === seat.seatNumber;
                        const statusClass = seat.isBooked ? 'booked' : isSelected ? 'selected' : 'available';
                        
                        return (
                          <div 
                            key={seat.seatNumber}
                            className={`seat ${statusClass}`}
                            onClick={() => handleSeatClick(seat)}
                            title={seat.seatNumber}
                          >
                            {seat.seatNumber.substring(1)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="legend">
                  <div className="legend-item">
                    <div className="legend-box available"></div> Available
                  </div>
                  <div className="legend-item">
                    <div className="legend-box selected"></div> Selected
                  </div>
                  <div className="legend-item">
                    <div className="legend-box booked"></div> Booked
                  </div>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '15px' }}
                    disabled={!selectedSeat || bookingLoading}
                    onClick={handleBooking}
                  >
                    {bookingLoading ? 'Processing...' : selectedSeat ? `Book Seat ${selectedSeat}` : 'Select a Seat'}
                  </button>
                  {!user && (
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--error)' }}>
                      You must be logged in to book tickets.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p>Loading seat map...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
