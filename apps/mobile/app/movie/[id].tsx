import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { ChevronLeft, Star, Clock, Calendar, Play, Heart, Bookmark } from "lucide-react-native";
import { C, imgUrl, tmdbGet } from "../../src/lib/theme";
import { useAuthStore } from "../../src/lib/store";

interface Detail {
  id: number; title: string; overview: string;
  poster_path: string | null; backdrop_path: string | null;
  vote_average: number; vote_count: number;
  release_date: string; runtime: number | null;
  genres: { id: number; name: string }[];
  tagline: string | null;
}
interface Credits {
  cast: { id: number; name: string; character: string; profile_path: string | null; credit_id: string }[];
  crew: { id: number; name: string; job: string; credit_id: string }[];
}
interface Videos { results: { id: string; key: string; type: string; site: string }[] }

export default function MovieDetail() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const [movie,   setMovie]   = useState<Detail | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, isLiked, isInWatchlist, toggleLike, toggleWatchlist } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    const n = Number(id);
    setLoading(true);
    Promise.all([
      tmdbGet<Detail>(`/movie/${n}`),
      tmdbGet<Credits>(`/movie/${n}/credits`),
      tmdbGet<Videos>(`/movie/${n}/videos`),
    ]).then(([m, c, v]) => {
      setMovie(m); setCredits(c);
      const t = v.results.find(x => x.type === "Trailer" && x.site === "YouTube");
      if (t) setTrailer(t.key);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={C.ember}/></View>;
  if (!movie)  return <View style={s.center}><Text style={{ color:C.silver }}>Movie not found</Text></View>;

  const year    = movie.release_date?.slice(0, 4) ?? "";
  const runtime = movie.runtime ? `${Math.floor(movie.runtime/60)}h ${movie.runtime%60}m` : "";
  const director = credits?.crew.find(c => c.job === "Director");
  const cast     = credits?.cast.slice(0, 6) ?? [];

  const snap = {
    id: movie.id, title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Connect your wallet in the Profile tab to save movies.");
      return;
    }
    toggleLike(snap);
  };

  const handleWatchlist = () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Connect your wallet in the Profile tab to save movies.");
      return;
    }
    toggleWatchlist(snap);
  };

  const openTrailer = () => {
    if (trailer) {
      Linking.openURL(`https://www.youtube.com/watch?v=${trailer}`);
    }
  };

  const liked       = isLiked(movie.id);
  const watchlisted = isInWatchlist(movie.id);

  return (
    <View style={{ flex:1, backgroundColor:C.void }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:100 }}>
        {/* Backdrop */}
        <View style={{ height:280 }}>
          <Image source={{ uri:imgUrl(movie.backdrop_path,"w780") }}
            style={StyleSheet.absoluteFillObject} contentFit="cover" transition={400}/>
          <LinearGradient colors={["rgba(8,8,16,0.15)", C.void]} locations={[0.35,1]}
            style={StyleSheet.absoluteFillObject}/>
          <SafeAreaView edges={["top"]} style={{ paddingHorizontal:16, paddingTop:4 }}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={20} color={C.white}/>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={s.content}>
          {/* Poster + info */}
          <View style={s.topRow}>
            <Image source={{ uri:imgUrl(movie.poster_path,"w300") }} style={s.poster} contentFit="cover"/>
            <View style={s.topRight}>
              <View style={s.genres}>
                {movie.genres.slice(0,2).map(g => (
                  <View key={g.id} style={s.genrePill}><Text style={s.genreTxt}>{g.name}</Text></View>
                ))}
              </View>
              <Text style={s.title}>{movie.title}</Text>
              {movie.tagline ? <Text style={s.tagline}>"{movie.tagline}"</Text> : null}
              <View style={s.metaRow}>
                <Star size={13} color={C.gold} fill={C.gold}/>
                <Text style={s.score}>{movie.vote_average.toFixed(1)}</Text>
                {runtime ? <><Text style={s.dot}>·</Text><Clock size={12} color={C.silver}/><Text style={s.metaTxt}>{runtime}</Text></> : null}
                <Text style={s.dot}>·</Text>
                <Calendar size={12} color={C.silver}/><Text style={s.metaTxt}>{year}</Text>
              </View>
            </View>
          </View>

          <Text style={s.overview}>{movie.overview}</Text>
          {director ? <Text style={s.director}><Text style={{ color:C.silver }}>Directed by </Text>{director.name}</Text> : null}

          {/* Action buttons */}
          <View style={s.actions}>
            {trailer && (
              <TouchableOpacity onPress={openTrailer} activeOpacity={0.85} style={{ flex:1 }}>
                <LinearGradient colors={[C.ember, C.emberDark]} style={s.trailerBtn}
                  start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
                  <Play size={14} color={C.white} fill={C.white}/>
                  <Text style={s.trailerTxt}>Trailer</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleLike} activeOpacity={0.82} style={{ flex:1 }}>
              <View style={[s.actionBtn, liked && s.actionBtnLiked]}>
                <Heart size={15} color={liked ? "#f87171" : C.silver} fill={liked ? "#f87171" : "none"}/>
                <Text style={[s.actionTxt, liked && { color:"#f87171" }]}>{liked ? "Liked" : "Like"}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleWatchlist} activeOpacity={0.82} style={{ flex:1 }}>
              <View style={[s.actionBtn, watchlisted && s.actionBtnWatchlist]}>
                <Bookmark size={15} color={watchlisted ? C.ember : C.silver} fill={watchlisted ? C.ember : "none"}/>
                <Text style={[s.actionTxt, watchlisted && { color:C.ember }]}>{watchlisted ? "Saved" : "Save"}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cast */}
          {cast.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map(a => (
                  <View key={a.credit_id} style={s.castItem}>
                    <Image source={{ uri:imgUrl(a.profile_path,"w200") }} style={s.castPhoto} contentFit="cover"/>
                    <Text style={s.castName} numberOfLines={1}>{a.name}</Text>
                    <Text style={s.castChar} numberOfLines={1}>{a.character}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex:1, alignItems:"center", justifyContent:"center", backgroundColor:C.void },
  backBtn: { width:40, height:40, borderRadius:99, backgroundColor:"rgba(8,8,16,0.75)", alignItems:"center", justifyContent:"center" },
  content: { padding:16 },
  topRow: { flexDirection:"row", gap:14, marginTop:-52, marginBottom:16 },
  poster: { width:110, height:165, borderRadius:16, shadowColor:"#000", shadowOffset:{width:0,height:12}, shadowOpacity:0.6, shadowRadius:20, elevation:12 },
  topRight: { flex:1, paddingTop:6 },
  genres: { flexDirection:"row", flexWrap:"wrap", gap:6, marginBottom:8 },
  genrePill: { backgroundColor:"rgba(255,107,44,0.12)", borderRadius:99, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:"rgba(255,107,44,0.25)" },
  genreTxt: { fontSize:11, color:C.ember, fontWeight:"600" },
  title: { fontSize:18, fontWeight:"800", color:C.white, lineHeight:24, marginBottom:4 },
  tagline: { fontSize:11, color:C.silver, fontStyle:"italic", marginBottom:8 },
  metaRow: { flexDirection:"row", alignItems:"center", gap:5, flexWrap:"wrap" },
  score: { fontSize:13, color:C.gold, fontWeight:"700" },
  dot: { color:C.silver },
  metaTxt: { fontSize:11, color:C.silver },
  overview: { fontSize:13, color:C.silverLt, lineHeight:22, marginBottom:12 },
  director: { fontSize:13, color:C.white, fontWeight:"500", marginBottom:16 },
  actions: { flexDirection:"row", gap:10, marginBottom:24 },
  trailerBtn: { height:48, borderRadius:14, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, shadowColor:C.ember, shadowOffset:{width:0,height:4}, shadowOpacity:0.35, shadowRadius:12, elevation:6 },
  trailerTxt: { color:C.white, fontSize:13, fontWeight:"700" },
  actionBtn: { height:48, borderRadius:14, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:7, backgroundColor:"rgba(255,255,255,0.06)", borderWidth:1, borderColor:"rgba(255,255,255,0.1)" },
  actionBtnLiked: { backgroundColor:"rgba(239,68,68,0.12)", borderColor:"rgba(239,68,68,0.35)" },
  actionBtnWatchlist: { backgroundColor:"rgba(255,107,44,0.12)", borderColor:"rgba(255,107,44,0.35)" },
  actionTxt: { fontSize:13, fontWeight:"600", color:C.silver },
  section: { marginBottom:20 },
  sectionTitle: { fontSize:18, fontWeight:"800", color:C.white, marginBottom:12 },
  castItem: { width:78, marginRight:12, alignItems:"center" },
  castPhoto: { width:78, height:78, borderRadius:14, marginBottom:6 },
  castName: { fontSize:11, color:C.white, fontWeight:"600", textAlign:"center" },
  castChar: { fontSize:10, color:C.silver, textAlign:"center", marginTop:2 },
});
