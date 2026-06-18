import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAuthStorage,
  clearAuthStorage,
  getStoredUser,
} from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type TypedAxios = {
  get<T = any>(url: string, config?: any): Promise<{ data: T }>;
  post<T = any>(url: string, data?: unknown, config?: any): Promise<{ data: T }>;
  patch<T = any>(url: string, data?: unknown, config?: any): Promise<{ data: T }>;
  put<T = any>(url: string, data?: unknown, config?: any): Promise<{ data: T }>;
  delete<T = any>(url: string, config?: any): Promise<{ data: T }>;
  interceptors: any;
};

const rawApi = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

const api = rawApi as unknown as TypedAxios;

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
        refreshToken,
      });
      const storedUser = getStoredUser();
      const authData = data as { accessToken: string; refreshToken: string; user?: NonNullable<typeof storedUser> };
      if (storedUser) {
        setAuthStorage(authData.accessToken, authData.refreshToken, authData.user ?? storedUser);
      }
      return authData.accessToken;
    } catch {
      clearAuthStorage();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

api.interceptors.request.use((config: any) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/register") &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return rawApi(original);
      }
    }
    return Promise.reject(error);
  }
);

interface CreateVolunteerData {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  university: string;
  major: string;
  skills: string[];
  experience: string;
  availableDays: string;
  supportType: string;
  inPerson: boolean;
  online: boolean;
  bio?: string;
  avatarUrl: string;
  otherSupportDesc?: string;
}

interface CreateSupportRequestData {
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  supportType: string;
  description: string;
  urgency: "low" | "medium" | "high" | "";
  supportDate: string;
  timeSlot: string;
  inPerson: boolean;
  online: boolean;
  otherSupportDesc?: string;
  preferredVolunteerId?: string | null;
  preferredVolunteerName?: string;
}

export const volunteerApi = {
  create: async (data: CreateVolunteerData) => {
    const response = await api.post("/volunteers", data);
    return response.data;
  },

  getAll: async (params?: { search?: string; supportType?: string }) => {
    const response = await api.get("/volunteers", { params });
    return response.data as any;
  },

  checkStatus: async (userId: string) => {
    const response = await api.get(`/volunteers/check/${userId}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/volunteers/${id}`);
    return response.data;
  },

  getReviews: async (id: string) => {
    const response = await api.get(`/volunteers/${id}/reviews`);
    return response.data;
  },
};

export const supportRequestApi = {
  create: async (data: CreateSupportRequestData) => {
    const response = await api.post("/requests", data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/requests");
    return response.data;
  },

  getUserRequests: async (userId: string) => {
    const response = await api.get(`/requests/user/${userId}`);
    return response.data;
  },

  getPending: async () => {
    const response = await api.get("/requests/pending");
    return response.data;
  },

  accept: async (id: string, data: { volunteerId: string; volunteerName: string }) => {
    const response = await api.patch(`/requests/${id}/accept`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/requests/${id}/status`, { status });
    return response.data;
  },

  rate: async (id: string, data: { rating: number; comment: string }) => {
    const response = await api.patch(`/requests/${id}/rate`, data);
    return response.data;
  },
};

export const resourceApi = {
  getByCategory: async (category: string) => {
    const response = await api.get("/resources", {
      params: { category },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/resources");
    return response.data;
  },

  create: async (data: {
    title: string;
    description: string;
    category: string;
    link?: string;
    author?: string;
  }) => {
    const response = await api.post("/resources", data);
    return response.data;
  },
};

export default api;
