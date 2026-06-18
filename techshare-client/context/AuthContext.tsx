"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import {
  AuthUser,
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAuthStorage,
  updateStoredUser,
} from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuth = useCallback(
    (accessToken: string, refreshToken: string, authUser: AuthUser) => {
      setAuthStorage(accessToken, refreshToken, authUser);
      setUser(authUser);
    },
    []
  );

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
        refreshToken,
      });
      const authData = data as AuthResponse;
      applyAuth(authData.accessToken, authData.refreshToken, authData.user);
      return true;
    } catch {
      clearAuthStorage();
      setUser(null);
      return false;
    }
  }, [applyAuth]);

  const bootstrap = useCallback(async () => {
    const storedUser = getStoredUser();
    const accessToken = getAccessToken();

    if (!storedUser || !accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setUser(storedUser);

    try {
      const { data } = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const meData = data as MeResponse;
      updateStoredUser(meData.user);
      setUser(meData.user);
    } catch {
      const ok = await refreshSession();
      if (!ok) setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });
      const authData = data as AuthResponse;
      applyAuth(authData.accessToken, authData.refreshToken, authData.user);
    },
    [applyAuth]
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, {
        fullName,
        email,
        password,
      });
      const authData = data as AuthResponse;
      applyAuth(authData.accessToken, authData.refreshToken, authData.user);
    },
    [applyAuth]
  );

  const logout = useCallback(async () => {
    const token = getAccessToken();
    try {
      if (token) {
        await axios.post(
          `${API_BASE}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      /* ignore */
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, isLoading, login, register, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
