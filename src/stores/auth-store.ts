import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export interface GuestCredentials {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  activeConnection: ActiveConnection | null;
  hasConnections: boolean;
  isLoading: boolean;
  isReady: boolean;

  // Guest mode
  isGuest: boolean;
  guestCredentials: GuestCredentials | null;

  setUser: (user: AuthUser | null) => void;
  setActiveConnection: (conn: ActiveConnection | null) => void;
  setHasConnections: (has: boolean) => void;
  setLoading: (loading: boolean) => void;
  setReady: (ready: boolean) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;

  // Guest actions
  enterGuestMode: (credentials: GuestCredentials) => void;
  updateGuestCredentials: (credentials: GuestCredentials) => void;
  exitGuestMode: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeConnection: null,
      hasConnections: false,
      isLoading: true,
      isReady: false,
      isGuest: false,
      guestCredentials: null,

      setUser: (user) => set({ user }),
      setActiveConnection: (conn) => set({ activeConnection: conn }),
      setHasConnections: (has) => set({ hasConnections: has }),
      setLoading: (isLoading) => set({ isLoading }),
      setReady: (isReady) => set({ isReady }),

      fetchUser: async () => {
        // If in guest mode, skip server auth check
        if (get().isGuest && get().guestCredentials) {
          set({ isLoading: false, isReady: true });
          return;
        }

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
        const { isGuest } = get();
        if (isGuest) {
          set({ isGuest: false, guestCredentials: null });
          window.location.href = "/login";
          return;
        }
        await fetch("/api/auth/logout", { method: "POST" });
        set({ user: null, activeConnection: null, hasConnections: false });
        window.location.href = "/login";
      },

      enterGuestMode: (credentials) => {
        set({
          isGuest: true,
          guestCredentials: credentials,
          user: null,
          activeConnection: {
            id: "guest",
            name: "Guest Bucket",
            bucketName: credentials.bucketName,
          },
          hasConnections: true,
          isLoading: false,
          isReady: true,
        });
      },

      updateGuestCredentials: (credentials) => {
        set({
          guestCredentials: credentials,
          activeConnection: {
            id: "guest",
            name: "Guest Bucket",
            bucketName: credentials.bucketName,
          },
        });
      },

      exitGuestMode: () => {
        set({
          isGuest: false,
          guestCredentials: null,
          activeConnection: null,
          hasConnections: false,
        });
      },
    }),
    {
      name: "r2-auth",
      partialize: (state) => ({
        isGuest: state.isGuest,
        guestCredentials: state.guestCredentials,
      }),
    }
  )
);
