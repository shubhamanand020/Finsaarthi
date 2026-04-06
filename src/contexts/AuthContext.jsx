import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorizedLogout = (event) => {
      clearAuthState();
      if (event?.detail?.showToast !== false) {
        toast.error(event?.detail?.message || 'Your session has expired. Please log in again.');
      }
    };

    window.addEventListener('auth:logout', handleUnauthorizedLogout);
    return () => window.removeEventListener('auth:logout', handleUnauthorizedLogout);
  }, []);

  const login = (userData, jwtToken) => {
    const normalizedUser = {
      ...userData,
      role: userData.role ? String(userData.role).toLowerCase() : 'student'
    };
    
    setUser(normalizedUser);
    setToken(jwtToken);
    
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', jwtToken);
    toast.success(`Welcome back, ${normalizedUser.name}!`);
  };

  const logout = () => {
    clearAuthState();
    toast.success("Successfully logged out.");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
