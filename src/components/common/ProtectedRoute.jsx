import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSuperAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
