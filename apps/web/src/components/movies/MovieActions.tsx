"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark, Play, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import type { SavedMovie } from "@/lib/types";

interface Props {
  movie: Omit<SavedMovie, "addedAt">;
  trailerKey: string | null;
}

export function MovieActions({ movie, trailerKey }: Props) {
  const { isAuthenticated, isLiked, isInWatchlist, toggleLike, toggleWatchlist } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const liked     = isLiked(movie.id);
  const watchlisted = isInWatchlist(movie.id);

  const snap: SavedMovie = { ...movie, addedAt: "" };

  const handleLike = () => {
    if (!isAuthenticated) { setAuthOpen(true); return; }
    toggleLike(snap);
  };
  const handleWatchlist = () => {
    if (!isAuthenticated) { setAuthOpen(true); return; }
    toggleWatchlist(snap);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Trailer */}
        {trailerKey && (
          <a href={`https://www.youtube.com/watch?v=${trailerKey}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-ember flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white">
            <Play size={15} className="fill-white" /> Watch Trailer
          </a>
        )}

        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleLike}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: liked ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${liked ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: liked ? "#f87171" : "#8892A4",
          }}
        >
          <Heart size={15} className={liked ? "fill-red-400 text-red-400" : ""} />
          {liked ? "Liked" : "Like"}
        </motion.button>

        {/* Watchlist */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleWatchlist}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: watchlisted ? "rgba(255,107,44,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${watchlisted ? "rgba(255,107,44,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: watchlisted ? "#FF6B2C" : "#8892A4",
          }}
        >
          <Bookmark size={15} className={watchlisted ? "fill-ember text-ember" : ""} />
          {watchlisted ? "In Watchlist" : "Watchlist"}
        </motion.button>

        {/* Guest nudge */}
        {!isAuthenticated && (
          <button onClick={() => setAuthOpen(true)}
            className="flex items-center gap-1.5 text-xs text-silver/50 hover:text-silver transition-colors">
            <LogIn size={12} /> Connect wallet to save
          </button>
        )}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
