import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo heading-gradient">
          <Film size={28} color="var(--primary)" />
          <span>TicketMaster</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Movies</Link>
          
          {user ? (
            <>
              <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={18} />
                <span>{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
