"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Search, User, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/movies/trending", label: "Trending" },
  { href: "/movies/popular", label: "Popular" },
  { href: "/movies/top-rated", label: "Top Rated" },
  { href: "/movies/upcoming", label: "Upcoming" },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) { router.push(`/search?q=${encodeURIComponent(trimmed)}`); setQ(""); setMobileOpen(false); }
  };

  const short = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}…${user.walletAddress.slice(-4)}`
    : "";
  const avatar = (user?.username ?? "?").slice(0, 1).toUpperCase();

  return (
    <>
      <motion.nav
        animate={{
          backgroundColor: scrolled ? "rgba(8,8,16,0.95)" : "rgba(8,8,16,0)",
          borderBottomColor: scrolled ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0)",
        }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-0 top-0 z-40 border-b"
        style={{ backdropFilter: scrolled ? "blur(22px)" : "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#FF6B2C,#E5521A)" }}>
              <Film size={16} className="text-white" />
            </div>
            <span className="hidden sm:block font-display font-bold text-[1.1rem] text-white leading-none">
              Cinema<span className="text-ember">Verse</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 rounded-lg text-silver hover:text-white hover:bg-white/5
                           text-sm font-medium transition-all duration-150">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-[280px] ml-auto">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver/40 pointer-events-none" />
              <input
                type="text" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search movies…"
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm text-white placeholder-silver/40
                           focus:outline-none focus:ring-1 focus:ring-ember/40 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-2">
            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl
                             hover:bg-white/5 transition-all duration-150"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                  text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#FF6B2C,#c87d00)" }}>
                    {avatar}
                  </div>
                  <span className="hidden sm:block text-sm text-white font-medium max-w-[110px] truncate">
                    {user.username ?? short}
                  </span>
                  <ChevronDown size={13} className={`text-silver/50 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl p-1.5 z-50"
                      style={{
                        background: "#13131f",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
                      }}
                    >
                      <div className="px-3 py-2.5 mb-0.5">
                        <p className="text-white text-sm font-semibold truncate">{user.username ?? "Anonymous"}</p>
                        <p className="text-silver/50 text-xs font-mono mt-0.5 truncate">{short}</p>
                      </div>
                      <div className="h-px my-1" style={{ background: "rgba(255,255,255,0.07)" }} />
                      <Link href="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-silver
                                   hover:text-white hover:bg-white/5 transition-all">
                        <User size={14} /> My Profile
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                                   text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut size={14} /> Disconnect Wallet
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="btn-ember px-4 py-2 rounded-xl text-sm font-semibold text-white"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-silver hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t overflow-hidden"
              style={{ background: "rgba(8,8,16,0.98)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="px-4 py-3 space-y-0.5">
                {NAV.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm text-silver hover:text-white hover:bg-white/5 transition-all">
                    {l.label}
                  </Link>
                ))}
                <form onSubmit={handleSearch} className="pt-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver/40 pointer-events-none" />
                    <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies…"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-silver/40 focus:outline-none focus:ring-1 focus:ring-ember/40 transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
