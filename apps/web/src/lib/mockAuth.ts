import type { User, SavedMovie } from "./types";

const DB_KEY    = "cv_db";
const TOKEN_KEY = "cv_token";
const USER_KEY  = "cv_user";

interface Row extends User { nonce?: string }

function db(): Record<string, Row> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(DB_KEY) ?? "{}"); }
  catch { return {}; }
}
function save(d: Record<string, Row>) {
  localStorage.setItem(DB_KEY, JSON.stringify(d));
}
function persist(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function blank(address: string): Row {
  const now = new Date().toISOString();
  return { id: address.toLowerCase(), walletAddress: address, createdAt: now, updatedAt: now, liked: [], watchlist: [] };
}

export const MockAuth = {
  exists(address: string): boolean {
    return !!db()[address.toLowerCase()];
  },

  nonce(address: string): { nonce: string; message: string } {
    const nonce = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));
    const d = db(); const key = address.toLowerCase();
    if (!d[key]) d[key] = blank(address);
    d[key]!.nonce = nonce;
    save(d);
    return {
      nonce,
      message: `CinemaVerse – Sign in\n\nWallet: ${address}\nNonce:  ${nonce}\n\nThis proves wallet ownership. No gas fee.`,
    };
  },

  login(address: string): User {
    const row = db()[address.toLowerCase()];
    if (!row) throw new Error("Wallet not registered");
    // migrate old users that lack liked/watchlist
    const user: User = { liked: [], watchlist: [], ...row };
    localStorage.setItem(TOKEN_KEY, btoa(`${address}:${Date.now()}`));
    persist(user);
    return user;
  },

  register(address: string, username?: string): User {
    const key = address.toLowerCase();
    const now = new Date().toISOString();
    const user: User = {
      id: key, walletAddress: address,
      username: username?.trim() || `${address.slice(0, 6)}…${address.slice(-4)}`,
      createdAt: now, updatedAt: now, liked: [], watchlist: [],
    };
    const d = db(); d[key] = { ...user }; save(d);
    localStorage.setItem(TOKEN_KEY, btoa(`${address}:${Date.now()}`));
    persist(user);
    return user;
  },

  session(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const u = JSON.parse(raw) as User;
      return { liked: [], watchlist: [], ...u };   // safe migrate
    } catch { return null; }
  },

  /** Toggle like. Returns updated user. */
  toggleLike(address: string, movie: SavedMovie): User {
    const d = db(); const key = address.toLowerCase();
    const row: Row = d[key] ?? blank(address);
    row.liked = row.liked ?? [];
    const idx = row.liked.findIndex(m => m.id === movie.id);
    if (idx >= 0) row.liked.splice(idx, 1);
    else row.liked.unshift({ ...movie, addedAt: new Date().toISOString() });
    row.updatedAt = new Date().toISOString();
    d[key] = row; save(d);
    const user: User = { liked: [], watchlist: [], ...row };
    persist(user);
    return user;
  },

  /** Toggle watchlist. Returns updated user. */
  toggleWatchlist(address: string, movie: SavedMovie): User {
    const d = db(); const key = address.toLowerCase();
    const row: Row = d[key] ?? blank(address);
    row.watchlist = row.watchlist ?? [];
    const idx = row.watchlist.findIndex(m => m.id === movie.id);
    if (idx >= 0) row.watchlist.splice(idx, 1);
    else row.watchlist.unshift({ ...movie, addedAt: new Date().toISOString() });
    row.updatedAt = new Date().toISOString();
    d[key] = row; save(d);
    const user: User = { liked: [], watchlist: [], ...row };
    persist(user);
    return user;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
