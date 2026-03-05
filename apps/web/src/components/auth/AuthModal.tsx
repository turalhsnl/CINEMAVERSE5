"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ── MetaMask Fox ─────────────────────────────────────────────────────────── */
function Fox({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193,65.8"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4,35.5 143.1,110.1 125.6,65.8"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1"/>
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.9 111.4,208.1"/>
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 211.8,247.4 207.1,208.1"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 111.6,206.8 80.3,207.7"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 207.1,206.8 211.8,247.4"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="230.8,162.1 174.6,164.6 179.7,193.5 188,176.1 208,185.2"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 130.5,176.1 138.8,193.5 144.1,164.6 87.8,162.1"/>
      <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 111.4,208.1 110.6,185.2"/>
      <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="208,185.2 207.1,208.1 230.8,162.1"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 177.9,106.9 193.6,65.8 125.1,65.8 140.6,106.9 144.1,164.6 145.3,182.8 145.4,227.6 173.1,227.6 173.3,182.8"/>
    </svg>
  );
}

/* ── Animated dots ────────────────────────────────────────────────────────── */
function Dots() {
  return (
    <span className="flex gap-1 items-center ml-2">
      {[0,1,2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-ember inline-block"
          style={{ animation: `pulse 1.2s ${i*0.2}s ease-in-out infinite` }} />
      ))}
    </span>
  );
}

const PHASE_LABELS: Record<string, string> = {
  connecting:   "Connecting to MetaMask…",
  checking:     "Checking wallet…",
  signing:      "Please sign in MetaMask…",
  "logging-in": "Signing you in…",
};

/* ── Registration panel (new wallet) ─────────────────────────────────────── */
function RegisterPanel() {
  const { register, walletAddress, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const short = walletAddress ? `${walletAddress.slice(0,7)}…${walletAddress.slice(-5)}` : "";

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-5">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background:"rgba(255,107,44,0.12)", border:"1px solid rgba(255,107,44,0.25)" }}>
          <UserPlus size={26} className="text-ember" />
        </div>
        <h3 className="font-display text-2xl font-bold text-white">Create Account</h3>
        <p className="text-silver text-sm">New wallet detected — set up your CinemaVerse profile</p>
        <span className="inline-block px-3 py-1 rounded-lg font-mono text-xs text-ember"
          style={{ background:"rgba(255,107,44,0.1)", border:"1px solid rgba(255,107,44,0.2)" }}>
          {short}
        </span>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest text-silver/70">
          Username <span className="normal-case font-normal text-silver/40">(optional)</span>
        </label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)}
          placeholder="e.g. CinephileMax" maxLength={32}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-silver/40
                     focus:outline-none focus:ring-1 focus:ring-ember/40 transition-all"
          style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}
        />
        <p className="text-xs text-silver/40">Leave blank to use your shortened address</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl p-3 text-sm"
          style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <button onClick={() => register(username || undefined)} disabled={isLoading}
        className="btn-ember w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2">
        <UserPlus size={15} />
        {isLoading ? "Creating account…" : "Create Account & Enter"}
      </button>
    </motion.div>
  );
}

/* ── Connect panel (existing or unknown wallet) ───────────────────────────── */
function ConnectPanel() {
  const { connectAndAuth, phase, error, clearError, isLoading } = useAuth();
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    setHasMetaMask(typeof window !== "undefined" && !!window.ethereum);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background:"rgba(255,107,44,0.1)", border:"1px solid rgba(255,107,44,0.25)" }}>
          <Fox size={38} />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Connect Wallet</h2>
        <p className="text-silver text-sm max-w-xs mx-auto leading-relaxed">
          Sign in or create an account with MetaMask — no password needed.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl p-4 space-y-2.5"
        style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
        {[
          { icon:<LogIn size={14}/>,    text:"Existing wallet → sign in instantly" },
          { icon:<UserPlus size={14}/>, text:"New wallet → create a free account" },
        ].map((r,i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm text-silver">
            <span className="text-ember flex-shrink-0">{r.icon}</span>
            {r.text}
          </div>
        ))}
      </div>

      {!hasMetaMask && (
        <div className="flex items-start gap-2.5 rounded-xl p-3 text-sm"
          style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)" }}>
          <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <span className="text-amber-300">
            MetaMask not detected.{" "}
            <a href="https://metamask.io/download" target="_blank" rel="noopener noreferrer"
              className="underline hover:text-amber-200">Install here →</a>
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl p-3 text-sm"
          style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400">{error}</p>
            <button onClick={clearError} className="text-red-400/60 hover:text-red-400 underline text-xs mt-0.5">Dismiss</button>
          </div>
        </div>
      )}

      {isLoading && PHASE_LABELS[phase] && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex items-center rounded-xl px-4 py-3"
          style={{ background:"rgba(255,107,44,0.08)", border:"1px solid rgba(255,107,44,0.18)" }}>
          <span className="text-ember/90 text-sm flex-1">{PHASE_LABELS[phase]}</span>
          <Dots />
        </motion.div>
      )}

      <button onClick={connectAndAuth} disabled={isLoading || !hasMetaMask}
        className="btn-ember w-full py-4 rounded-xl font-semibold text-sm text-white
                   flex items-center justify-center gap-3">
        <Fox size={22} />
        {isLoading ? "Waiting for MetaMask…" : "Connect with MetaMask"}
      </button>

      <p className="text-center text-xs text-silver/40">
        Connecting your wallet will either sign you in or guide you through account creation.
      </p>
    </div>
  );
}

/* ── Modal shell ──────────────────────────────────────────────────────────── */
export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose(): void }) {
  const { needsRegistration, isAuthenticated } = useAuth();

  useEffect(() => { if (isAuthenticated) onClose(); }, [isAuthenticated, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:"rgba(8,8,16,0.82)", backdropFilter:"blur(10px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

          <motion.div initial={{ opacity:0, scale:0.9, y:24 }} animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.9, y:24 }} transition={{ type:"spring", damping:26, stiffness:340 }}
            className="relative w-full max-w-md rounded-3xl p-8"
            style={{
              background:"linear-gradient(150deg,#141424 0%,#1c1c30 100%)",
              border:"1px solid rgba(255,255,255,0.09)",
              boxShadow:"0 40px 100px rgba(0,0,0,0.7),0 0 80px rgba(255,107,44,0.06)",
            }}>

            <div className="absolute inset-x-1/4 top-0 h-px rounded-full"
              style={{ background:"linear-gradient(90deg,transparent,rgba(255,107,44,0.7),transparent)" }} />

            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center
                         text-silver/60 hover:text-white hover:bg-white/5 transition-all">
              <X size={15} />
            </button>

            {needsRegistration ? <RegisterPanel /> : <ConnectPanel />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
