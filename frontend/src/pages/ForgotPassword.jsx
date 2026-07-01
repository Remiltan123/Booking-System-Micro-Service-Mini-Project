import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/user-service/api/users/forgot-password', { email });
      setSubmitted(true);
      showToast('Password reset email sent.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not send reset email. Please try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <h2 className="auth-title heading-gradient">Forgot Password</h2>

        {submitted ? (
          <>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '20px' }}>
              If an account exists for <strong>{email}</strong>, a password reset link has been
              sent. Check your inbox and follow the link to choose a new password.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '25px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : <><Mail size={18} /> Send Reset Link</>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
              Remembered your password? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
