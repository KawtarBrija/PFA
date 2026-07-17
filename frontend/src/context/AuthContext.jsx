import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../services/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getAccessToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) {
          clearTokens();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setTokens(data.accessToken, data.refreshToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // best-effort: proceed with local logout even if the server call fails
      }
    }
    clearTokens();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, loading, login, logout, setUser }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
