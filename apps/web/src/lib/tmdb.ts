import type {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBCredits,
  TMDBVideosResponse,
  TMDBPage,
  MovieCategory,
} from "./types";

const BASE = "https://api.themoviedb.org/3";
const IMG  = "https://image.tmdb.org/t/p";
export const API_KEY = "29ac6d551489a65e06cf01bf59271249";

/** Build a full TMDB image URL */
export function img(
  path: string | null | undefined,
  size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) return "/placeholder.svg";
  return `${IMG}/${size}${path}`;
}

async function get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status} ${res.statusText} → ${endpoint}`);
  return res.json() as Promise<T>;
}

export const TMDB = {
  trending:  (window: "day" | "week" = "week") =>
    get<TMDBPage<TMDBMovie>>(`/trending/movie/${window}`),

  list: (cat: MovieCategory, page = 1) => {
    const ep: Record<MovieCategory, string> = {
      trending:   "/trending/movie/week",
      popular:    "/movie/popular",
      top_rated:  "/movie/top_rated",
      upcoming:   "/movie/upcoming",
      now_playing:"/movie/now_playing",
    };
    return get<TMDBPage<TMDBMovie>>(ep[cat], { page });
  },

  detail:  (id: number) => get<TMDBMovieDetail>(`/movie/${id}`),
  credits: (id: number) => get<TMDBCredits>(`/movie/${id}/credits`),
  videos:  (id: number) => get<TMDBVideosResponse>(`/movie/${id}/videos`),
  similar: (id: number, page = 1) => get<TMDBPage<TMDBMovie>>(`/movie/${id}/similar`, { page }),

  search:  (query: string, page = 1) =>
    get<TMDBPage<TMDBMovie>>("/search/movie", { query, page }),

  discover: (genreId: number, page = 1) =>
    get<TMDBPage<TMDBMovie>>("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    }),
};
