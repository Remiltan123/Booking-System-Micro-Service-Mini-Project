/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  useEffect(() => {
    // Check if token exists on load and fetch user profile
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        try {
          const response = await apiClient.get(`/user-service/api/users/getuser/${userId}`);
          setUser({ ...response.data, id: userId });
        } catch (error) {
          console.error("Auth init error:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/user-service/api/users/login', { email, password });
    const { token, _id, name } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('userId', _id);
    setUser({ id: _id, name, email });
    
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await apiClient.post('/user-service/api/users/register', { name, email, password });
    const { token, _id } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('userId', _id);
    setUser({ id: _id, name, email });
    
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
