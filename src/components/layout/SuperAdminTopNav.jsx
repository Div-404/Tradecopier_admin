import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function SuperAdminTopNav() {
  const { currentUser, logout, brokers, packages, transactions } = useSuperAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="superadmin-top-nav">
      <div className="container-fluid px-3 px-xl-4 h-100">
        <div className="d-flex align-items-center justify-content-between h-100">
          
          {/* Brand Logo on Left */}
          <div className="d-flex align-items-center">
            <NavLink to="/dashboard" className="text-decoration-none d-flex align-items-center gap-2">
              <img 
                src="/logo.png" 
                alt="TradeCopier" 
                className="nav-brand-logo" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </NavLink>
          </div>

          {/* Central High-Visibility Segmented Navigation Bar */}
          <div className="d-none d-md-flex align-items-center justify-content-center flex-grow-1 mx-3 mx-xl-4">
            <nav className="top-nav-segmented-track" aria-label="Primary Navigation">
              
              {/* Broker Registrations Tab */}
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `top-nav-tab ${isActive ? 'active' : ''}`}
              >
                <span className="top-nav-icon-box">
                  <i className="bi bi-person-check-fill"></i>
                </span>
                <span>Dashboard</span>
                {/* {brokers.filter(b => b.status === 'Pending').length > 0 ? (
                  <span className="top-nav-badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706', borderColor: '#FDE68A' }}>
                    {brokers.filter(b => b.status === 'Pending').length} Pending
                  </span>
                ) : (
                  <span className="top-nav-badge">
                    {brokers.length} Brokers
                  </span>
                )} */}
              </NavLink>

              {/* Finance Management Tab */}
              <NavLink 
                to="/finance" 
                className={({ isActive }) => `top-nav-tab ${isActive ? 'active' : ''}`}
              >
                <span className="top-nav-icon-box">
                  <i className="bi bi-wallet2"></i>
                </span>
                <span>Finance</span>
                {/* <span className="top-nav-badge">
                  {packages.length} Plans
                </span> */}
              </NavLink>

              {/* Package Transaction History Tab */}
              <NavLink 
                to="/transactions" 
                className={({ isActive }) => `top-nav-tab ${isActive ? 'active' : ''}`}
              >
                <span className="top-nav-icon-box">
                  <i className="bi bi-receipt"></i>
                </span>
                <span>Transaction History</span>
                {/* <span className="top-nav-badge">
                  {transactions?.length || 0}
                </span> */}
              </NavLink>

            </nav>
          </div>

          {/* Right Section: User Profile Pill */}
          <div className="d-flex align-items-center gap-2">
            
            <div className="position-relative">
              <button 
                type="button"
                className="btn btn-link text-decoration-none p-2 d-flex align-items-center gap-2 border-0 bg-transparent shadow-none"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ cursor: 'pointer' }}
                aria-expanded={showProfileDropdown}
                aria-label="User Profile Menu"
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold shadow-2xs"
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    background: 'linear-gradient(135deg, #EDFAE6 0%, #A3E6A3 100%)',
                    border: '2px solid #86efac',
                    fontSize: '0.85rem'
                  }}
                >
                  {currentUser?.avatar || 'AV'}
                </div>
                <div className="d-none d-sm-flex flex-column text-start">
                  <span className="fw-bold text-dark" style={{ fontSize: '0.85rem', lineHeight: 1.15 }}>
                    {currentUser?.name || 'Alexander Vance'}
                  </span>
                  <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                    Super Administrator
                  </span>
                </div>
                <i className="bi bi-chevron-down text-secondary d-none d-sm-inline ms-1" style={{ fontSize: '0.7rem' }}></i>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div 
                  className="dropdown-menu show position-absolute end-0 mt-2 p-2 shadow-lg border border-secondary border-opacity-15 rounded-3 bg-white"
                  style={{ minWidth: '220px', zIndex: 1060 }}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <div className="px-3 py-2 border-bottom border-light">
                    <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{currentUser?.name}</div>
                    <div className="text-secondary text-truncate" style={{ fontSize: '0.75rem' }}>{currentUser?.email}</div>
                  </div>
                  <div className="py-1">
                    <button 
                      type="button" 
                      className="dropdown-item d-flex align-items-center gap-2 py-2 rounded-2 text-danger fw-semibold"
                      style={{ fontSize: '0.82rem' }}
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button 
              type="button"
              className="btn btn-light d-md-none border p-2 px-2 rounded-3 shadow-2xs"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-5`}></i>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="d-md-none bg-white border-top border-secondary border-opacity-15 py-3 px-2 shadow-sm rounded-bottom-4">
            <nav className="d-flex flex-column gap-2">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `top-nav-tab w-100 ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="top-nav-icon-box">
                  <i className="bi bi-person-check-fill"></i>
                </span>
                <span>Broker Registrations</span>
                <span className="top-nav-badge ms-auto">
                  {brokers.filter(b => b.status === 'Pending').length > 0 
                    ? `${brokers.filter(b => b.status === 'Pending').length} Pending`
                    : brokers.length
                  }
                </span>
              </NavLink>

              <NavLink 
                to="/finance" 
                className={({ isActive }) => `top-nav-tab w-100 ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="top-nav-icon-box">
                  <i className="bi bi-wallet2"></i>
                </span>
                <span>Finance Management</span>
                <span className="top-nav-badge ms-auto">{packages.length}</span>
              </NavLink>

              <NavLink 
                to="/transactions" 
                className={({ isActive }) => `top-nav-tab w-100 ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="top-nav-icon-box">
                  <i className="bi bi-receipt"></i>
                </span>
                <span>Transaction History</span>
                <span className="top-nav-badge ms-auto">{transactions?.length || 0}</span>
              </NavLink>

              <div className="border-top pt-2 mt-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
