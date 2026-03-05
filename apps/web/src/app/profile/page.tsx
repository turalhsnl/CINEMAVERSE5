"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Copy, Check, LogOut, User, Heart, Bookmark, Film, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { img } from "@/lib/tmdb";
import type { SavedMovie } from "@/lib/types";

type Tab = "liked" | "watchlist";

function MovieGrid({ movies }: { movies: SavedMovie[] }) {
  if (!movies.length) return (
    <div className="py-16 text-center text-silver/50 text-sm">
      Nothing here yet — browse movies and start saving!
    </div>
  );
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {movies.map(m => (
        <Link key={m.id} href={`/movie/${m.id}`} className="block group">
          <div className="relative rounded-xl overflow-hidden card-lift" style={{ aspectRatio:"2/3" }}>
            <Image src={img(m.poster_path)} alt={m.title} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width:640px) 33vw,16vw" />
          </div>
          <p className="mt-2 text-xs text-white font-medium truncate group-hover:text-ember transition-colors">{m.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={9} className="fill-gold text-gold" />
            <span className="text-[10px] text-gold">{m.vote_average.toFixed(1)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout, walletAddress } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("liked");

  const copy = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="w-full max-w-sm text-center space-y-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background:"linear-gradient(135deg,#FF6B2C,#E5521A)", boxShadow:"0 10px 40px rgba(255,107,44,0.4)" }}>
              <Wallet size={36} className="text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Connect your wallet</h2>
            <p className="text-silver text-sm">Sign in to view your profile, liked movies and watchlist</p>
            <button onClick={() => setAuthOpen(true)}
              className="btn-ember w-full py-3.5 rounded-xl font-semibold text-sm text-white">
              Connect Wallet
            </button>
          </motion.div>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  const shortFull = walletAddress ? `${walletAddress.slice(0,10)}…${walletAddress.slice(-8)}` : "";
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "";
  const liked     = user?.liked ?? [];
  const watchlist = user?.watchlist ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-6">

        {/* Profile card */}
        <div className="rounded-3xl p-8 relative overflow-hidden"
          style={{ background:"linear-gradient(145deg,#13131f,#1b1b2e)", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
          <div className="absolute inset-x-1/3 top-0 h-px rounded-full"
            style={{ background:"linear-gradient(90deg,transparent,rgba(255,107,44,0.5),transparent)" }} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
              style={{ background:"linear-gradient(135deg,#FF6B2C,#c87d00)", boxShadow:"0 8px 30px rgba(255,107,44,0.35)" }}>
              {(user?.username ?? "A").slice(0,1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl font-bold text-white mb-1 truncate">{user?.username ?? "Anonymous"}</h1>
              {joined && <p className="text-silver text-sm mb-3">Member since {joined}</p>}
              <button onClick={copy}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm transition-all hover:border-ember/40"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)" }}>
                <Wallet size={13} className="text-ember" />
                <span className="font-mono text-silver/80 text-xs">{shortFull}</span>
                {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-silver/40" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon:<Film  size={20} className="text-ember" />, val: String(liked.length + watchlist.length), label:"Total Saved" },
            { icon:<Heart size={20} className="text-red-400"/>, val: String(liked.length),     label:"Liked" },
            { icon:<Bookmark size={20} className="text-ember"/>, val: String(watchlist.length), label:"Watchlist" },
          ].map(({ icon, val, label }) => (
            <div key={label} className="rounded-2xl p-5 flex flex-col items-center gap-2"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
              {icon}
              <span className="font-display text-2xl font-bold text-white">{val}</span>
              <span className="text-silver text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            {([["liked","Liked Movies",<Heart size={14}/>],["watchlist","Watchlist",<Bookmark size={14}/>]] as const).map(([key,label,icon]) => (
              <button key={key} onClick={() => setTab(key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab===key ? "rgba(255,107,44,0.15)" : "transparent",
                  color: tab===key ? "#FF6B2C" : "#8892A4",
                  border: tab===key ? "1px solid rgba(255,107,44,0.3)" : "1px solid transparent",
                }}>
                {icon}{label}
                <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                  style={{ background:"rgba(255,255,255,0.07)", color:"#8892A4" }}>
                  {tab===key ? (key==="liked"?liked.length:watchlist.length) : (key==="liked"?liked.length:watchlist.length)}
                </span>
              </button>
            ))}
          </div>

          <MovieGrid movies={tab==="liked" ? liked : watchlist} />
        </div>

        {/* Account details */}
        <div className="rounded-2xl p-6" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2 mb-4">
            <User size={17} className="text-ember" /> Account Details
          </h2>
          {[
            { label:"Auth Method", value:"MetaMask / Web3", accent:true },
            { label:"Wallet",      value:shortFull },
            { label:"Joined",      value:joined },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-3.5 text-sm"
              style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-silver">{row.label}</span>
              <span className={row.accent ? "text-ember font-semibold" : "text-white"}>{row.value}</span>
            </div>
          ))}
        </div>

        <button onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10"
          style={{ border:"1px solid rgba(239,68,68,0.2)" }}>
          <LogOut size={15} /> Disconnect Wallet
        </button>
      </motion.div>
    </div>
  );
}
