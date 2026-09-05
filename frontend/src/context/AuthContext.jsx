import { createContext, useContext, useState } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function persistSession(data) {
    // data: { token, id, username, email, roles }
    localStorage.setItem('token', data.token);
    const userInfo = { id: data.id, username: data.username, email: data.email, roles: data.roles };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
  }

  async function login(username, password) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.post('/api/auth/login', { username, password });
      persistSession(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(username, email, password) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.post('/api/auth/register', { username, email, password });
      persistSession(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider value={{ user, isAdmin, error, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
