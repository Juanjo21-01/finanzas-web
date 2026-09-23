import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAuthToken, getAuthToken, setAuthToken } from '@/lib/api';

const AUTH_USER_STORAGE_KEY = 'finanzas_user';
const AuthContext = createContext(null);

function readSavedUser() {
  try {
    if (!getAuthToken()) return null;
    const savedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!savedUser) return null;

    const parsedUser = JSON.parse(savedUser);
    return parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email
      ? parsedUser
      : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session?.token || !session?.user) {
    throw new Error('El servidor no devolvió una sesión válida.');
  }

  setAuthToken(session.token);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session.user));
  return session.user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(false);

  const clearSession = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) {
      clearAuthToken();
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }

    const handleExpiredSession = () => {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      setUser(null);
    };

    window.addEventListener('finanzas:session-expired', handleExpiredSession);
    return () => window.removeEventListener('finanzas:session-expired', handleExpiredSession);
  }, [user]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const session = await api.post('auth/login', {
        email,
        password,
        device_name: 'finanzas-web',
      });
      const signedInUser = saveSession(session);
      setUser(signedInUser);
      return signedInUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    setLoading(true);
    try {
      const session = await api.post('auth/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      const newUser = saveSession(session);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (getAuthToken()) {
        await api.post('auth/logout');
      }
    } catch {
      // The local session still closes if the API is unavailable.
    } finally {
      clearSession();
      setLoading(false);
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return context;
}
