import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SuperAdminProvider } from './context/SuperAdminContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import LoginPage from './pages/auth/LoginPage';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import SubscriptionsPage from './pages/subscriptions/SubscriptionsPage';
import PackageTransactionsPage from './pages/transactions/PackageTransactionsPage';

export default function App() {
  return (
    <SuperAdminProvider>
      <HashRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected SuperAdmin Area with Top Navigation (NO LEFT BAR) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SuperAdminLayout>
                  <SuperAdminDashboard />
                </SuperAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <SuperAdminLayout>
                  <SubscriptionsPage />
                </SuperAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <SuperAdminLayout>
                  <PackageTransactionsPage />
                </SuperAdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Root redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </SuperAdminProvider>
  );
}
