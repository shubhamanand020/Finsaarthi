import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const normalizeRole = (value) => String(value || '').toLowerCase();

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!token || !user) {
    return <Navigate to="/login/student" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const currentRole = normalizeRole(user.role);
    const hasAllowedRole = allowedRoles.map(normalizeRole).includes(currentRole);

    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
