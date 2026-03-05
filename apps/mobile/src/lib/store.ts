import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  addedAt: string;
}

export interface AppUser {
  id: string;
  walletAddress: string;
  username?: string;
  createdAt: string;
  liked: SavedMovie[];
  watchlist: SavedMovie[];
}

interface AuthStore {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loadSession(): Promise<void>;
  connectWallet(address: string, username?: string): Promise<void>;
  toggleLike(movie: Omit<SavedMovie, "addedAt">): Promise<void>;
  toggleWatchlist(movie: Omit<SavedMovie, "addedAt">): Promise<void>;
  isLiked(id: number): boolean;
  isInWatchlist(id: number): boolean;
  logout(): Promise<void>;
  clearError(): void;
}

const DB_KEY   = "cv_mobile_db";
const USER_KEY = "cv_mobile_user";

async function saveUser(user: AppUser) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  const dbRaw = await AsyncStorage.getItem(DB_KEY);
  const db: Record<string, AppUser> = dbRaw ? JSON.parse(dbRaw) : {};
  db[user.id] = user;
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:            null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,

  loadSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) {
        const u = JSON.parse(raw) as AppUser;
        const user: AppUser = { liked: [], watchlist: [], ...u };
        set({ user, isAuthenticated: true });
      }
    } catch {}
  },

  connectWallet: async (address, username) => {
    set({ isLoading: true, error: null });
    try {
      const dbRaw = await AsyncStorage.getItem(DB_KEY);
      const db: Record<string, AppUser> = dbRaw ? JSON.parse(dbRaw) : {};
      const key = address.toLowerCase();
      let user: AppUser;
      if (db[key]) {
        user = { liked: [], watchlist: [], ...db[key]! };
      } else {
        user = {
          id: key, walletAddress: address,
          username: username?.trim() || `${address.slice(0,6)}…${address.slice(-4)}`,
          createdAt: new Date().toISOString(),
          liked: [], watchlist: [],
        };
      }
      await saveUser(user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed", isLoading: false });
    }
  },

  toggleLike: async (movie) => {
    const { user } = get();
    if (!user) return;
    const liked = [...(user.liked ?? [])];
    const idx = liked.findIndex(m => m.id === movie.id);
    if (idx >= 0) liked.splice(idx, 1);
    else liked.unshift({ ...movie, addedAt: new Date().toISOString() });
    const updated = { ...user, liked };
    await saveUser(updated);
    set({ user: updated });
  },

  toggleWatchlist: async (movie) => {
    const { user } = get();
    if (!user) return;
    const watchlist = [...(user.watchlist ?? [])];
    const idx = watchlist.findIndex(m => m.id === movie.id);
    if (idx >= 0) watchlist.splice(idx, 1);
    else watchlist.unshift({ ...movie, addedAt: new Date().toISOString() });
    const updated = { ...user, watchlist };
    await saveUser(updated);
    set({ user: updated });
  },

  isLiked:       (id) => !!(get().user?.liked ?? []).find(m => m.id === id),
  isInWatchlist: (id) => !!(get().user?.watchlist ?? []).find(m => m.id === id),

  logout: async () => {
    await AsyncStorage.removeItem(USER_KEY);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
