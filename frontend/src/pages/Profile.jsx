import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/apiClient';
import { User, Mail, Ticket, XCircle, Pencil, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const startEditing = () => {
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPassword('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const updates = { name: editName, email: editEmail };
      if (editPassword) updates.password = editPassword;

      await updateProfile(updates);
      showToast('Profile updated successfully.', 'success');
      setIsEditing(false);
      setEditPassword('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      showToast(message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

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
      showToast('Booking cancelled successfully.', 'success');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel booking.';
      setBookingError(message);
      showToast(message, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="container page-wrapper animate-fade-in" style={{ maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '30px' }}>
          <h2 className="heading-gradient" style={{ margin: 0, fontSize: '2rem' }}>
            My Profile
          </h2>
          {!isEditing && (
            <button className="btn btn-outline" onClick={startEditing} title="Edit profile">
              <Pencil size={16} /> Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                placeholder="Your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingProfile}>
                <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsEditing(false)}
                disabled={savingProfile}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
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
        )}

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
