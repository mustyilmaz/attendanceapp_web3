import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('authToken') != null;
  return isAuthenticated ? children : <Navigate to="/admin" />;
};
  

export default ProtectedRoute;
