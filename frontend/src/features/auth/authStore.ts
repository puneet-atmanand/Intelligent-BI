import { create } from "zustand";

export interface Permission {
  id: string;
  code: string;
  name: string;
  resource: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  permissions: Permission[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  roles: Role[];
  permissions: string[];
}

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@askyourdata.local",
  full_name: "System Administrator",
  is_active: true,
  is_superuser: true,
  roles: [
    {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Admin",
      description: "Full administrative access",
      is_system: true,
      permissions: [],
    },
  ],
  permissions: [
    "databases:read", "databases:write",
    "datasets:read", "datasets:write",
    "charts:read", "charts:write",
    "dashboards:read", "dashboards:write",
    "sqllab:use", "uploads:use",
    "admin:access", "ai:use",
  ],
};

interface AuthState {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_ADMIN_USER,
  isAuthenticated: true,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    try {
      const response = await fetch("/api/v1/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const user: UserProfile = await response.json();
        set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch {
      // Retain default admin session in dev bypass mode
      set({ user: DEFAULT_ADMIN_USER, isAuthenticated: true, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.message || "Failed to sign in. Check your credentials.";
        if (data.details?.errors && Array.isArray(data.details.errors)) {
          const detailMsgs = data.details.errors
            .map((e: { loc?: string[]; msg?: string }) => `${e.loc?.slice(-1)[0]}: ${e.msg}`)
            .join(", ");
          if (detailMsgs) {
            errorMsg = `${errorMsg} (${detailMsgs})`;
          }
        }
        set({
          error: errorMsg,
          isLoading: false,
        });
        return false;
      }

      if (data.access_token) {
        localStorage.setItem("ayd_token", data.access_token);
      }

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      set({
        error: `Network error connecting to backend: ${errMsg}`,
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem("ayd_token");
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem("ayd_token");
      set({ user: DEFAULT_ADMIN_USER, isAuthenticated: true, error: null });
    }
  },
}));

