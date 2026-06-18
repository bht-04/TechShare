const ACCESS_KEY = "techshare_access_token";
const REFRESH_KEY = "techshare_refresh_token";
const USER_KEY = "techshare_user";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setAuthStorage = (
  accessToken: string,
  refreshToken: string,
  user: AuthUser
) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const updateStoredUser = (user: AuthUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
