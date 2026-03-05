import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import type { TMDBMovie } from "@/lib/types";

interface Props {
  title: string;
  movies: TMDBMovie[];
  isLoading?: boolean;
  viewAllHref?: string;
  limit?: number;
}

export function MovieRow({ title, movies, isLoading, viewAllHref, limit = 12 }: Props) {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5 px-0.5">
        <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-ember hover:text-ember-light text-sm font-medium transition-colors"
          >
            See all <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies.slice(0, limit).map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
      </div>
    </section>
  );
}
