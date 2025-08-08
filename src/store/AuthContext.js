import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    console.log('🔥 AuthContext: Iniciando listener de auth state');
    
    // Timeout para el loading inicial
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ AuthContext: Timeout de carga inicial alcanzado');
        setLoading(false);
        setConnectionStatus('timeout');
      }
    }, 10000); // 10 segundos timeout
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 AuthContext: Cambio de estado de auth:', user ? `Usuario: ${user.email}` : 'Sin usuario');
      
      clearTimeout(loadingTimeout);
      
      setCurrentUser(user);
      setLoading(false);
      
      // REMOVIDO: Verificación de conexión que causaba loops
      // La conexión se verificará solo cuando sea necesario
      setConnectionStatus('connected');
    }, (error) => {
      console.error('❌ AuthContext: Error en auth state listener:', error);
      clearTimeout(loadingTimeout);
      setError(error.message);
      setLoading(false);
      setConnectionStatus('error');
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      setError(error.message);
      console.error('Error al cerrar sesión:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = useMemo(() => ({
    currentUser,
    loading,
    error,
    connectionStatus,
    logout,
    clearError,
    setError
  }), [currentUser, loading, error, connectionStatus]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;