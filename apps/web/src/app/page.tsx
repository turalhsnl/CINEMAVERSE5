import { TMDB } from "@/lib/tmdb";
import { Hero } from "@/components/movies/Hero";
import { MovieRow } from "@/components/movies/MovieRow";

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, popular, topRated, upcoming] = await Promise.all([
    TMDB.trending("week").catch(() => ({ results: [] as never[] })),
    TMDB.list("popular").catch(() => ({ results: [] as never[] })),
    TMDB.list("top_rated").catch(() => ({ results: [] as never[] })),
    TMDB.list("upcoming").catch(() => ({ results: [] as never[] })),
  ]);

  return (
    <>
      <Hero movies={trending.results} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <MovieRow
          title="Trending This Week"
          movies={trending.results}
          viewAllHref="/movies/trending"
        />
        <MovieRow
          title="Popular Now"
          movies={popular.results}
          viewAllHref="/movies/popular"
        />
        <MovieRow
          title="Top Rated All Time"
          movies={topRated.results}
          viewAllHref="/movies/top-rated"
        />
        <MovieRow
          title="Coming Soon"
          movies={upcoming.results}
          viewAllHref="/movies/upcoming"
        />
      </div>
    </>
  );
}
