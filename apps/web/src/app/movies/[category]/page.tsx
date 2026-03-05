import type { Metadata } from "next";
import { TMDB } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/MovieCard";
import type { MovieCategory } from "@/lib/types";

const CONFIG: Record<string, { label: string; cat: MovieCategory }> = {
  trending:    { label: "Trending Movies",  cat: "trending" },
  popular:     { label: "Popular Movies",   cat: "popular" },
  "top-rated": { label: "Top Rated Movies", cat: "top_rated" },
  upcoming:    { label: "Upcoming Movies",  cat: "upcoming" },
  "now-playing":{ label: "Now Playing",    cat: "now_playing" },
};

export function generateStaticParams() {
  return Object.keys(CONFIG).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  return { title: CONFIG[params.category]?.label ?? "Movies" };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const cfg = CONFIG[params.category];
  if (!cfg) return <p className="pt-28 text-center text-silver">Category not found</p>;

  const data = await TMDB.list(cfg.cat).catch(() => ({ results: [] as never[] }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">{cfg.label}</h1>
        <p className="text-silver mt-1.5 text-sm">
          {data.results.length} movies
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {data.results.map((m, i) => (
          <MovieCard key={m.id} movie={m} index={i} />
        ))}
      </div>
    </div>
  );
}
