// ── TMDB ────────────────────────────────────────────────────────────────────
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
}

export interface TMDBGenre { id: number; name: string }

export interface TMDBMovieDetail extends TMDBMovie {
  budget: number;
  genres: TMDBGenre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  revenue: number;
  runtime: number | null;
  status: string;
  tagline: string | null;
  belongs_to_collection: { id: number; name: string; poster_path: string | null; backdrop_path: string | null } | null;
}

export interface TMDBCast {
  id: number; name: string; character: string;
  profile_path: string | null; order: number; credit_id: string;
}
export interface TMDBCrew {
  id: number; name: string; job: string; department: string;
  profile_path: string | null; credit_id: string;
}
export interface TMDBCredits { id: number; cast: TMDBCast[]; crew: TMDBCrew[] }
export interface TMDBVideo { id: string; key: string; name: string; site: string; type: string; official: boolean }
export interface TMDBVideosResponse { id: number; results: TMDBVideo[] }
export interface TMDBPage<T> { page: number; results: T[]; total_pages: number; total_results: number }
export type MovieCategory = "trending" | "popular" | "top_rated" | "upcoming" | "now_playing";

// ── Saved movie snapshot (stored locally so profile works offline) ──────────
export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  addedAt: string;
}

// ── Auth / User ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
  liked: SavedMovie[];
  watchlist: SavedMovie[];
}

// ── Ethereum (MetaMask) ──────────────────────────────────────────────────────
export interface EthereumProvider {
  isMetaMask?: boolean;
  selectedAddress: string | null;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window { ethereum?: EthereumProvider }
}
