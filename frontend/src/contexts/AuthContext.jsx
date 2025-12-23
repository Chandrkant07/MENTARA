import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      let hydratedUser = null;
      if (storedUser) {
        try {
          hydratedUser = JSON.parse(storedUser);
          setUser(hydratedUser);
          // Don't block the app on a network call if we already have a user snapshot.
          setLoading(false);
        } catch {
          hydratedUser = null;
        }
      }

      try {
        // If we didn't have a stored user, we must fetch one before unblocking protected routes.
        if (!hydratedUser) {
          const response = await userAPI.getMe();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          setLoading(false);
          return;
        }

        // Otherwise, refresh profile in the background.
        const response = await userAPI.getMe();
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (err) {
        const status = err?.response?.status;
        // Only hard-logout on an actual auth failure.
        if (status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
        // For transient network/5xx issues, keep the hydrated user and let the app continue.
        if (!hydratedUser) setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authAPI.login(username, password);
      const { access, refresh, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { access, refresh, user: newUser } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));

      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      const errorData = err.response?.data || {};
      let errorMessage = 'Registration failed';
      
      if (errorData.username) {
        errorMessage = `Username: ${errorData.username[0]}`;
      } else if (errorData.email) {
        errorMessage = `Email: ${errorData.email[0]}`;
      } else if (errorData.password) {
        errorMessage = `Password: ${errorData.password[0]}`;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear storage regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    // Backend uses role values like 'STUDENT' | 'TEACHER' | 'ADMIN'
    isStudent: user?.role === 'STUDENT',
    isTeacher: user?.role === 'TEACHER',
    isAdmin: user?.role === 'ADMIN' || user?.is_superuser === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
