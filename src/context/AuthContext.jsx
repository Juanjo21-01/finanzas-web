import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  clearStoredSession,
  prepareSessionStorage,
  readStoredSession,
  saveStoredSession,
} from '@/lib/secureSession';

const AuthContext = createContext(null);

function validateSession(session) {
  if (!session?.token || !session?.user) {
    throw new Error('El servidor no devolvió una sesión válida.');
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const handleExpiredSession = () => {
      clearStoredSession();
      setUser(null);
    };

    window.addEventListener('finanzas:session-expired', handleExpiredSession);

    readStoredSession()
      .then((session) => {
        if (active) setUser(session?.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
      window.removeEventListener('finanzas:session-expired', handleExpiredSession);
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      await prepareSessionStorage();
      const session = await api.post('auth/login', {
        email,
        password,
        device_name: 'finanzas-web',
      });
      validateSession(session);
      await saveStoredSession(session);
      setUser(session.user);
      return session.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    setLoading(true);
    try {
      await prepareSessionStorage();
      const session = await api.post('auth/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      validateSession(session);
      await saveStoredSession(session);
      setUser(session.user);
      return session.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const session = await readStoredSession();
      if (session?.token) await api.post('auth/logout');
    } catch {
      // The local session still closes if the API is unavailable.
    } finally {
      clearStoredSession();
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      loading,
      login,
      register,
      logout,
    }),
    [user, ready, loading, login, register, logout],
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
