import { create } from "zustand";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ActiveConnection {
  id: string;
  name: string;
  bucketName: string;
}

interface AuthState {
  user: AuthUser | null;
  activeConnection: ActiveConnection | null;
  hasConnections: boolean;
  isLoading: boolean;
  isReady: boolean;

  setUser: (user: AuthUser | null) => void;
  setActiveConnection: (conn: ActiveConnection | null) => void;
  setHasConnections: (has: boolean) => void;
  setLoading: (loading: boolean) => void;
  setReady: (ready: boolean) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  activeConnection: null,
  hasConnections: false,
  isLoading: true,
  isReady: false,

  setUser: (user) => set({ user }),
  setActiveConnection: (conn) => set({ activeConnection: conn }),
  setHasConnections: (has) => set({ hasConnections: has }),
  setLoading: (isLoading) => set({ isLoading }),
  setReady: (isReady) => set({ isReady }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        set({ user: null, isLoading: false, isReady: true });
        return;
      }
      const data = await res.json();
      set({
        user: data.user,
        activeConnection: data.activeConnection,
        hasConnections: data.hasConnections,
        isLoading: false,
        isReady: true,
      });
    } catch {
      set({ user: null, isLoading: false, isReady: true });
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null, activeConnection: null, hasConnections: false });
    window.location.href = "/login";
  },
}));
