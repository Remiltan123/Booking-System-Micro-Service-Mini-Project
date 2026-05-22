import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { User, Mail, Ticket, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setBookingError('');

    try {
      const response = await apiClient.get('/booking-service/api/bookings/my');
      setBookings(response.data || []);
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let ignore = false;

    const loadBookings = async () => {
      try {
        const response = await apiClient.get('/booking-service/api/bookings/my');

        if (!ignore) {
          setBookings(response.data || []);
          setBookingError('');
        }
      } catch (error) {
        if (!ignore) {
          setBookingError(error.response?.data?.message || 'Failed to load bookings.');
        }
      } finally {
        if (!ignore) {
          setLoadingBookings(false);
        }
      }
    };

    loadBookings();

    return () => {
      ignore = true;
    };
  }, [user, navigate]);

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    setBookingError('');

    try {
      await apiClient.delete(`/booking-service/api/bookings/${bookingId}`);
      await fetchBookings();
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="container page-wrapper animate-fade-in" style={{ maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 className="heading-gradient" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>
          My Profile
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '50%' }}>
              <User size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>{user.name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ background: 'var(--secondary)', padding: '10px', borderRadius: '50%' }}>
              <Mail size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>{user.email}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Ticket size={20} color="var(--primary)" /> My Bookings
          </h3>

          {bookingError && <div className="error-message">{bookingError}</div>}

          {loadingBookings ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No bookings yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                    padding: '15px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '6px' }}>{booking.movieTitle}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      Seat {booking.seatNumber} | {booking.status}
                    </div>
                  </div>

                  {booking.status !== 'CANCELLED' && (
                    <button
                      className="btn btn-outline"
                      disabled={cancellingId === booking._id}
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      <XCircle size={16} />
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
