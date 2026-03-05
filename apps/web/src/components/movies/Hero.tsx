"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, ChevronRight, Info } from "lucide-react";
import { img } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/types";

export function Hero({ movies }: { movies: TMDBMovie[] }) {
  const pool = movies.slice(0, 6);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % pool.length), 7000);
    return () => clearInterval(t);
  }, [pool.length]);

  if (!pool.length) return null;
  const m   = pool[idx]!;
  const year = m.release_date?.slice(0, 4) ?? "";

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "92vh", minHeight: 560 }}>
      {/* Backdrop */}
      <AnimatePresence mode="crossfade">
        <motion.div
          key={m.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
          className="absolute inset-0"
        >
          <Image
            src={img(m.backdrop_path, "original")}
            alt={m.title}
            fill priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/60 to-void/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
          {/* Subtle vignette */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,107,44,0.08) 0%, transparent 70%)" }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.45 }}
              className="max-w-xl"
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-5"
                style={{ background: "rgba(255,107,44,0.85)" }}
              >
                🔥 Featured
              </span>

              <h1 className="font-display font-bold text-white leading-[1.06] mb-4"
                style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
                {m.title}
              </h1>

              <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                <span className="flex items-center gap-1.5 text-gold font-bold text-base">
                  <Star size={15} className="fill-gold" />
                  {m.vote_average.toFixed(1)}
                </span>
                <span className="text-silver/50">·</span>
                <span className="text-silver">{year}</span>
                <span className="text-silver/50">·</span>
                <span className="text-silver/60 text-xs">{m.vote_count.toLocaleString()} ratings</span>
              </div>

              <p className="text-silver-light text-[0.95rem] leading-relaxed mb-8 line-clamp-3">
                {m.overview}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/movie/${m.id}`}
                  className="btn-ember flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white"
                >
                  <Play size={15} className="fill-white" />
                  View Details
                </Link>
                <Link
                  href={`/movie/${m.id}`}
                  className="glass flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                             text-sm text-white hover:bg-white/10 transition-all"
                >
                  <Info size={14} /> More Info
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot nav */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {pool.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className="p-0.5">
            <div className={`rounded-full transition-all duration-350 ${
              i === idx ? "w-7 h-2 bg-ember" : "w-2 h-2 bg-white/25 hover:bg-white/45"
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}
