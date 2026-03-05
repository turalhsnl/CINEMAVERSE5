export const C = {
  void:      "#080810",
  void100:   "#12121f",
  void200:   "#1a1a2e",
  ember:     "#FF6B2C",
  emberDark: "#E5521A",
  gold:      "#F0A500",
  silver:    "#8892A4",
  silverLt:  "#B8C0CC",
  white:     "#FFFFFF",
  error:     "#EF4444",
};

export const TMDB_KEY  = "29ac6d551489a65e06cf01bf59271249";
export const TMDB_BASE = "https://api.themoviedb.org/3";

export function imgUrl(
  path: string | null | undefined,
  size = "w500"
): string {
  if (!path) return "https://placehold.co/300x450/1a1a2e/8892A4?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function tmdbGet<T>(
  ep: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${ep}`);
  url.searchParams.set("api_key", TMDB_KEY);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  return r.json();
}
