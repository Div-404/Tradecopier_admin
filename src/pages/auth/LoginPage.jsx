import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useSuperAdmin();
  const navigate = useNavigate();

  const [email, setEmail] = useState('superadmin@tradecopier.io');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // If already logged in, navigate to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div 
        className="custom-card p-4 p-sm-5 shadow-lg border-0 bg-white" 
        style={{ maxWidth: '460px', width: '100%', borderRadius: '22px' }}
      >
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center mb-3">
            <img 
              src="/logo.png" 
              alt="TradeCopier" 
              style={{ height: '48px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <h3 className="fw-bolder text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            TradeCopier
          </h3>
          <div className="d-flex justify-content-center mb-2">
            <span className="brand-badge">
              Super Admin Console
            </span>
          </div>
          <p className="text-secondary small mb-0">
            Multi-Broker Trading Infrastructure & Management
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-end-0">
                <i className="bi bi-person-fill-lock"></i>
              </span>
              <input 
                type="email" 
                className="form-control border-start-0 ps-0" 
                placeholder="superadmin@tradecopier.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-end-0">
                <i className="bi bi-shield-lock-fill"></i>
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control border-start-0 border-end-0 ps-0" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="btn btn-light border border-start-0 text-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label text-secondary small" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            {/* <span className="text-success small fw-semibold">
              <i className="bi bi-shield-check me-1"></i>2FA Active
            </span> */}
          </div>

          {/* Primary Login Button */}
          <button 
            type="submit" 
            className="btn btn-neon-primary w-100 py-2.5 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right"></i>
            )}
            <span>Sign In to SuperAdmin</span>
          </button>
        </form>

        {/* Security Footer */}
        {/* <div className="mt-4 pt-3 border-top text-center text-secondary" style={{ fontSize: '0.74rem' }}>
          <i className="bi bi-lock-fill text-success me-1"></i>
          Encrypted TLS 1.3 SuperAdmin Session • Dedicated Multi-Broker API
        </div> */}

      </div>
    </div>
  );
}
