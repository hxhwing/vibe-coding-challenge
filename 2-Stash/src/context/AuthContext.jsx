
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('stash_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('stash_user');
      }
    }
    setLoading(false);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      const data = await response.json();
      const user = { email, uid: data.uid };
      setUser(user);
      localStorage.setItem('stash_user', JSON.stringify(user));
      return user; // Return the user data on successful login
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      // Auto login after signup
      // The backend should return user data on signup, or we can call login
      // For now, assuming signup returns user data similar to login
      const userData = await response.json(); // Assuming signup also returns user data
      const user = { email, uid: userData.uid }; // Adjust based on actual signup response
      setUser(user);
      localStorage.setItem('stash_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stash_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
