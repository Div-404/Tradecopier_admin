import React from 'react';
import SuperAdminTopNav from '../components/layout/SuperAdminTopNav';
import ToastNotification from '../components/common/ToastNotification';

export default function SuperAdminLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Toast Notification Container */}
      <ToastNotification />

      {/* Top Navigation Bar (NO LEFT BAR) */}
      <SuperAdminTopNav />

      {/* Main Content Workspace */}
      <main className="flex-grow-1 container-fluid px-3 px-xl-4 py-4">
        {children}
      </main>

      {/* Subtle SuperAdmin Footer */}
      <footer className="border-top border-secondary border-opacity-10 py-3 bg-white bg-opacity-60 mt-auto">
        <div className="container-fluid px-3 px-xl-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-secondary" style={{ fontSize: '0.78rem' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">TradeCopier SuperAdmin Platform</span>
            {/* <span>• Multi-Broker Central Command & Billing</span> */}
          </div>
          {/* <div className="d-flex align-items-center gap-3">
            <span>High-Availability Bridge v5.0</span>
            <span>Equinix LD4/NY4</span>
            <span className="text-success fw-bold">
              <i className="bi bi-shield-check me-1"></i>All Services Nominal
            </span>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
