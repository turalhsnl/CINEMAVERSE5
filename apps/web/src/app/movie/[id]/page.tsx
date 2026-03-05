import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Star, Clock, Calendar, ChevronLeft, Globe, TrendingUp } from "lucide-react";
import { TMDB, img } from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/MovieRow";
import { MovieActions } from "@/components/movies/MovieActions";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await TMDB.detail(Number(params.id)).catch(() => null);
  return m ? { title: m.title, description: m.overview } : { title: "Movie" };
}

export default async function MoviePage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const [movie, credits, videos, similar] = await Promise.all([
    TMDB.detail(id).catch(() => null),
    TMDB.credits(id).catch(() => ({ cast: [], crew: [] })),
    TMDB.videos(id).catch(() => ({ results: [] })),
    TMDB.similar(id).catch(() => ({ results: [] })),
  ]);
  if (!movie) notFound();

  const year     = movie.release_date?.slice(0, 4) ?? "";
  const runtime  = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "";
  const director = credits.crew.find(c => c.job === "Director");
  const cast     = credits.cast.slice(0, 8);
  const trailer  = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");

  // Minimal movie snapshot for like/watchlist storage
  const snap = {
    id: movie.id, title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    addedAt: "",
  };

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative overflow-hidden" style={{ height:"68vh", minHeight:480 }}>
        <Image src={img(movie.backdrop_path,"original")} alt={movie.title}
          fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-6 mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-silver hover:text-white text-sm transition-colors">
            <ChevronLeft size={15} /> Back
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8 -mt-44 relative z-10">
          {/* Poster */}
          <div className="flex-shrink-0 w-40 sm:w-52 md:w-60">
            <div className="rounded-2xl overflow-hidden ring-1 ring-white/10"
              style={{ boxShadow:"0 24px 64px rgba(0,0,0,0.7)" }}>
              <Image src={img(movie.poster_path)} alt={movie.title} width={240} height={360} className="w-full h-auto" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres.map(g => (
                <span key={g.id} className="px-3 py-1 rounded-full text-xs font-semibold text-ember"
                  style={{ background:"rgba(255,107,44,0.1)", border:"1px solid rgba(255,107,44,0.22)" }}>
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-display font-bold text-white leading-tight mb-2"
              style={{ fontSize:"clamp(1.8rem,4vw,3rem)" }}>
              {movie.title}
            </h1>
            {movie.tagline && <p className="text-silver italic text-base mb-4">&ldquo;{movie.tagline}&rdquo;</p>}

            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
              <span className="flex items-center gap-1.5 text-gold font-bold text-lg">
                <Star size={16} className="fill-gold" />
                {movie.vote_average.toFixed(1)}
                <span className="text-silver font-normal text-xs ml-0.5">({movie.vote_count.toLocaleString()})</span>
              </span>
              {runtime && <span className="flex items-center gap-1.5 text-silver"><Clock size={13} /> {runtime}</span>}
              <span className="flex items-center gap-1.5 text-silver"><Calendar size={13} /> {year}</span>
              <span className="flex items-center gap-1.5 text-silver">
                <TrendingUp size={13} />{Math.round(movie.popularity).toLocaleString()}
              </span>
              {movie.homepage && (
                <a href={movie.homepage} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-ember hover:text-ember-light transition-colors">
                  <Globe size={13} /> Official Site
                </a>
              )}
            </div>

            <p className="text-silver-light leading-relaxed mb-5 max-w-2xl text-[0.95rem]">{movie.overview}</p>
            {director && (
              <p className="text-sm mb-5">
                <span className="text-silver/55">Directed by </span>
                <span className="text-white font-semibold">{director.name}</span>
              </p>
            )}

            {/* ← Like / Watchlist / Trailer buttons — client component */}
            <MovieActions movie={snap} trailerKey={trailer?.key ?? null} />
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-white mb-5">Cast</h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {cast.map(a => (
                <div key={a.credit_id} className="text-center group">
                  <div className="aspect-square rounded-xl overflow-hidden mb-2" style={{ background:"#1a1a2e" }}>
                    <Image src={img(a.profile_path,"w200")} alt={a.name} width={100} height={100}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-white text-[11px] font-semibold truncate">{a.name}</p>
                  <p className="text-silver/50 text-[10px] truncate">{a.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.results.length > 0 && (
          <MovieRow title="You Might Also Like" movies={similar.results} limit={6} />
        )}
      </div>
    </div>
  );
}
