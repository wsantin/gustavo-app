import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Box, CircularProgress } from '@mui/material';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  console.log('🛡️ ProtectedRoute: loading =', loading, 'currentUser =', currentUser?.email || 'null');

  if (loading) {
    console.log('🔄 ProtectedRoute: Mostrando loading...');
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    console.log('🚫 ProtectedRoute: Sin usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: Usuario autenticado, mostrando contenido');
  return children;
}

export default ProtectedRoute;