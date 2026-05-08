import { useAuth } from '../context/AuthContext';
import { User, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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

        <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
            Your booking history will appear here once the Booking Service is fully integrated.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
