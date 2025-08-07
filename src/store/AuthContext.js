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

  useEffect(() => {
    console.log('🔥 AuthContext: Iniciando listener de auth state');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 AuthContext: Cambio de estado de auth:', user ? `Usuario: ${user.email}` : 'Sin usuario');
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
    logout,
    clearError,
    setError
  }), [currentUser, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;