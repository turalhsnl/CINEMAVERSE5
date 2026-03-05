"use client";

import React, { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import { MockAuth } from "@/lib/mockAuth";
import type { User, SavedMovie } from "@/lib/types";

type Phase = "idle"|"connecting"|"checking"|"signing"|"logging-in"|"registering"|"authenticated"|"error";

interface State {
  phase: Phase;
  user: User | null;
  walletAddress: string | null;
  needsRegistration: boolean;
  error: string | null;
  _pending: { address: string; signature: string } | null;
}

type Action =
  | { type: "RESTORE"; user: User }
  | { type: "SET_PHASE"; phase: Phase }
  | { type: "SET_WALLET"; address: string }
  | { type: "NEEDS_REGISTRATION"; address: string; signature: string }
  | { type: "AUTHENTICATED"; user: User }
  | { type: "UPDATE_USER"; user: User }
  | { type: "ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "LOGOUT" };

const init: State = { phase: "idle", user: null, walletAddress: null, needsRegistration: false, error: null, _pending: null };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "RESTORE":          return { ...s, phase: "authenticated", user: a.user, walletAddress: a.user.walletAddress };
    case "SET_PHASE":        return { ...s, phase: a.phase };
    case "SET_WALLET":       return { ...s, walletAddress: a.address };
    case "NEEDS_REGISTRATION": return { ...s, phase: "registering", needsRegistration: true, _pending: { address: a.address, signature: a.signature } };
    case "AUTHENTICATED":    return { ...s, phase: "authenticated", user: a.user, needsRegistration: false, _pending: null, error: null };
    case "UPDATE_USER":      return { ...s, user: a.user };
    case "ERROR":            return { ...s, phase: "error", error: a.message };
    case "CLEAR_ERROR":      return { ...s, phase: "idle", error: null };
    case "LOGOUT":           return { ...init };
    default:                 return s;
  }
}

interface AuthCtx extends State {
  isAuthenticated: boolean;
  isLoading: boolean;
  connectAndAuth(): Promise<void>;
  register(username?: string): Promise<void>;
  logout(): void;
  clearError(): void;
  toggleLike(movie: SavedMovie): void;
  toggleWatchlist(movie: SavedMovie): void;
  isLiked(movieId: number): boolean;
  isInWatchlist(movieId: number): boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside <AuthProvider>");
  return c;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, init);

  useEffect(() => {
    const u = MockAuth.session();
    if (u) dispatch({ type: "RESTORE", user: u });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handle = (accounts: unknown[]) => {
      if ((accounts as string[]).length === 0) { MockAuth.logout(); dispatch({ type: "LOGOUT" }); }
    };
    window.ethereum.on("accountsChanged", handle);
    return () => window.ethereum?.removeListener("accountsChanged", handle);
  }, []);

  const connectAndAuth = useCallback(async () => {
    dispatch({ type: "CLEAR_ERROR" });
    if (typeof window === "undefined" || !window.ethereum) {
      dispatch({ type: "ERROR", message: "MetaMask not detected. Install the MetaMask browser extension and refresh." });
      return;
    }
    try {
      dispatch({ type: "SET_PHASE", phase: "connecting" });
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts?.length) throw new Error("MetaMask returned no accounts.");
      const address = accounts[0]!;
      dispatch({ type: "SET_WALLET", address });

      dispatch({ type: "SET_PHASE", phase: "checking" });
      const alreadyRegistered = MockAuth.exists(address);
      const { message } = MockAuth.nonce(address);

      dispatch({ type: "SET_PHASE", phase: "signing" });
      const signature = (await window.ethereum.request({ method: "personal_sign", params: [message, address] })) as string;

      if (alreadyRegistered) {
        dispatch({ type: "SET_PHASE", phase: "logging-in" });
        const user = MockAuth.login(address);
        dispatch({ type: "AUTHENTICATED", user });
      } else {
        dispatch({ type: "NEEDS_REGISTRATION", address, signature });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      dispatch({ type: "ERROR", message: msg.includes("4001") || msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied")
        ? "You rejected the MetaMask request. Click Connect to try again."
        : msg,
      });
    }
  }, []);

  const register = useCallback(async (username?: string) => {
    if (!state._pending) { dispatch({ type: "ERROR", message: "Session expired — please start over." }); return; }
    try {
      dispatch({ type: "SET_PHASE", phase: "registering" });
      const user = MockAuth.register(state._pending.address, username);
      dispatch({ type: "AUTHENTICATED", user });
    } catch (err: unknown) {
      dispatch({ type: "ERROR", message: err instanceof Error ? err.message : "Registration failed" });
    }
  }, [state._pending]);

  const logout = useCallback(() => { MockAuth.logout(); dispatch({ type: "LOGOUT" }); }, []);
  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  const toggleLike = useCallback((movie: SavedMovie) => {
    if (!state.walletAddress) return;
    const updated = MockAuth.toggleLike(state.walletAddress, movie);
    dispatch({ type: "UPDATE_USER", user: updated });
  }, [state.walletAddress]);

  const toggleWatchlist = useCallback((movie: SavedMovie) => {
    if (!state.walletAddress) return;
    const updated = MockAuth.toggleWatchlist(state.walletAddress, movie);
    dispatch({ type: "UPDATE_USER", user: updated });
  }, [state.walletAddress]);

  const isLiked      = useCallback((id: number) => !!state.user?.liked?.some(m => m.id === id), [state.user]);
  const isInWatchlist = useCallback((id: number) => !!state.user?.watchlist?.some(m => m.id === id), [state.user]);

  const LOADING: Phase[] = ["connecting","checking","signing","logging-in"];

  return (
    <Ctx.Provider value={{
      ...state,
      isAuthenticated: state.phase === "authenticated",
      isLoading: LOADING.includes(state.phase),
      connectAndAuth, register, logout, clearError,
      toggleLike, toggleWatchlist, isLiked, isInWatchlist,
    }}>
      {children}
    </Ctx.Provider>
  );
}
