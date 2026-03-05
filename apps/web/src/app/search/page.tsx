"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { TMDB } from "@/lib/tmdb";
import { MovieCard, MovieCardSkeleton } from "@/components/movies/MovieCard";
import type { TMDBMovie } from "@/lib/types";

export default function SearchPage() {
  const params  = useSearchParams();
  const query   = params.get("q") ?? "";
  const [movies, setMovies]   = useState<TMDBMovie[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) { setMovies([]); setTotal(0); return; }
    setLoading(true);
    TMDB.search(query)
      .then((r) => { setMovies(r.results); setTotal(r.total_results); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Search size={22} className="text-ember" />
          <h1 className="font-display text-3xl font-bold text-white">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
        </div>
        {!loading && query && (
          <p className="text-silver text-sm ml-9">
            {total.toLocaleString()} movies found
          </p>
        )}
      </div>

      {!query ? (
        <div className="py-28 flex flex-col items-center gap-4 text-silver">
          <Search size={52} className="opacity-15" />
          <p>Enter a search term in the navbar to find movies</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.length === 0
            ? (
              <p className="col-span-full py-24 text-center text-silver">
                No results for &ldquo;{query}&rdquo;
              </p>
            )
            : movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)
          }
        </div>
      )}
    </div>
  );
}
