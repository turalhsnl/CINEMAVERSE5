"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { img } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/types";

interface Props { movie: TMDBMovie; index?: number }

export function MovieCard({ movie, index = 0 }: Props) {
  const year  = movie.release_date?.slice(0, 4) ?? "";
  const score = movie.vote_average.toFixed(1);
  const scoreColor =
    movie.vote_average >= 7.5 ? "text-gold" :
    movie.vote_average >= 6   ? "text-silver-light" : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.35 }}
    >
      <Link href={`/movie/${movie.id}`} className="block group cursor-pointer">
        {/* Poster */}
        <div className="relative rounded-xl overflow-hidden card-lift" style={{ aspectRatio: "2/3" }}>
          <Image
            src={img(movie.poster_path)}
            alt={movie.title}
            fill
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,18vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating badge */}
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{ background: "rgba(8,8,16,0.88)", backdropFilter: "blur(6px)" }}
          >
            <Star size={9} className={`fill-current ${scoreColor}`} />
            <span className={`text-[11px] font-bold ${scoreColor}`}>{score}</span>
          </div>

          {/* Hover title overlay */}
          <div className="absolute bottom-0 inset-x-0 p-3 translate-y-1 opacity-0
                          group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{movie.title}</p>
          </div>
        </div>

        {/* Below-card info */}
        <div className="mt-2.5 space-y-0.5 px-0.5">
          <p className="text-white text-sm font-medium truncate group-hover:text-ember transition-colors duration-200">
            {movie.title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-silver/60">
            <span>{year}</span>
            <span>·</span>
            <Star size={9} className="fill-gold text-gold" />
            <span className="text-gold font-semibold">{score}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div>
      <div className="rounded-xl shimmer" style={{ aspectRatio: "2/3" }} />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-3.5 rounded-md shimmer w-5/6" />
        <div className="h-3 rounded-md shimmer w-2/5" />
      </div>
    </div>
  );
}
