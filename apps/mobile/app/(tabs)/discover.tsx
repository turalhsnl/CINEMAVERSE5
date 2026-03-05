import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import { C, imgUrl, tmdbGet } from "../../src/lib/theme";

const GENRES = [
  { id: 28,    name: "Action",    emoji: "💥" },
  { id: 35,    name: "Comedy",    emoji: "😂" },
  { id: 18,    name: "Drama",     emoji: "🎭" },
  { id: 27,    name: "Horror",    emoji: "👻" },
  { id: 878,   name: "Sci-Fi",    emoji: "🚀" },
  { id: 10749, name: "Romance",   emoji: "❤️"  },
  { id: 53,    name: "Thriller",  emoji: "😱" },
  { id: 16,    name: "Animation", emoji: "🎨" },
  { id: 12,    name: "Adventure", emoji: "🗺️"  },
];

interface Movie {
  id: number; title: string; backdrop_path: string | null;
  vote_average: number; release_date: string;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [genre, setGenre]   = useState(GENRES[0]!);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    tmdbGet<{ results: Movie[] }>("/discover/movie", {
      with_genres: genre.id, sort_by: "popularity.desc",
    })
      .then(r => setMovies(r.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [genre]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.void }} edges={["top"]}>
      <Text style={s.title}>Discover</Text>

      {/* Genre chips */}
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        data={GENRES} keyExtractor={g => String(g.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.chip, genre.id === item.id && s.chipActive]}
            onPress={() => setGenre(item)}
          >
            <Text style={s.chipEmoji}>{item.emoji}</Text>
            <Text style={[s.chipTxt, genre.id === item.id && s.chipTxtActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={C.ember} />
        </View>
      ) : (
        <FlatList
          data={movies} numColumns={2} keyExtractor={m => String(m.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push(`/movie/${item.id}` as never)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: imgUrl(item.backdrop_path, "w500") }}
                style={StyleSheet.absoluteFillObject} contentFit="cover"
              />
              <View style={s.cardOverlay} />
              <View style={s.cardFoot}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Star size={10} color={C.gold} fill={C.gold} />
                  <Text style={s.cardScore}>{item.vote_average.toFixed(1)}</Text>
                  <Text style={s.cardYear}>{item.release_date?.slice(0, 4)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: C.white, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, backgroundColor: C.void100, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  chipActive: { backgroundColor: "rgba(255,107,44,0.14)", borderColor: C.ember },
  chipEmoji: { fontSize: 14 },
  chipTxt: { fontSize: 13, color: C.silver, fontWeight: "600" },
  chipTxtActive: { color: C.ember },
  card: { flex: 1, height: 155, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(8,8,16,0.45)", top: "40%" },
  cardFoot: { position: "absolute", bottom: 10, left: 10, right: 10 },
  cardTitle: { fontSize: 11, color: C.white, fontWeight: "700", marginBottom: 3 },
  cardScore: { fontSize: 10, color: C.gold, fontWeight: "700" },
  cardYear: { fontSize: 10, color: C.silver, marginLeft: 4 },
});
