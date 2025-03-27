import React, {
  createContext, useContext, useState, useEffect, useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sessionActions } from '../../store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.session.user);
  const server = useSelector((state) => state.session.server);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          const response = await fetch('/api/session');
          if (response.ok) {
            const userData = await response.json();
            dispatch(sessionActions.updateUser(userData));
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    if (server) {
      checkAuth();
    }
  }, [user, server, dispatch]);

  const value = useMemo(() => ({
    authChecked,
    loading,
    isAuthenticated: !!user,
    user,
  }), [authChecked, loading, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
