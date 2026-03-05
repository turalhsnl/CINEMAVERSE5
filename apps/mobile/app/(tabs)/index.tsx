import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, FlatList,
  TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star, Play, Film } from "lucide-react-native";
import { C, imgUrl, tmdbGet } from "../../src/lib/theme";

const W = Dimensions.get("window").width;

interface Movie {
  id: number; title: string; poster_path: string | null;
  backdrop_path: string | null; vote_average: number;
  release_date: string; overview: string;
}
interface Page { results: Movie[] }

function SmallCard({ movie, onPress }: { movie: Movie; onPress: () => void }) {
  const year = movie.release_date?.slice(0, 4) ?? "";
  return (
    <TouchableOpacity onPress={onPress} style={s.card} activeOpacity={0.82}>
      <Image
        source={{ uri: imgUrl(movie.poster_path, "w300") }}
        style={s.cardImg} contentFit="cover" transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(8,8,16,0.9)"]}
        style={s.cardGrad}
      />
      <View style={s.badge}>
        <Star size={9} color={C.gold} fill={C.gold} />
        <Text style={s.badgeScore}>{movie.vote_average.toFixed(1)}</Text>
      </View>
      <View style={s.cardFoot}>
        <Text style={s.cardTitle} numberOfLines={1}>{movie.title}</Text>
        <Text style={s.cardYear}>{year}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Section({ title, data, onItem }: {
  title: string; data: Movie[]; onItem: (id: number) => void;
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={s.sectionTitle}>{title}</Text>
      <FlatList
        data={data.slice(0, 10)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <SmallCard movie={item} onPress={() => onItem(item.id)} />
        )}
      />
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular]   = useState<Movie[]>([]);
  const [top, setTop]           = useState<Movie[]>([]);
  const hero = trending[0];

  useEffect(() => {
    tmdbGet<Page>("/trending/movie/week").then(r => setTrending(r.results)).catch(() => {});
    tmdbGet<Page>("/movie/popular").then(r => setPopular(r.results)).catch(() => {});
    tmdbGet<Page>("/movie/top_rated").then(r => setTop(r.results)).catch(() => {});
  }, []);

  const go = (id: number) => router.push(`/movie/${id}` as never);

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <SafeAreaView edges={["top"]}>
          <View style={s.header}>
            <View style={s.logoRow}>
              <View style={s.logoIcon}>
                <Film size={18} color={C.white} />
              </View>
              <Text style={s.logoText}>
                Cinema<Text style={{ color: C.ember }}>Verse</Text>
              </Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Hero */}
        {hero && (
          <TouchableOpacity
            onPress={() => go(hero.id)}
            activeOpacity={0.94}
            style={s.hero}
          >
            <Image
              source={{ uri: imgUrl(hero.backdrop_path, "w780") }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={500}
            />
            <LinearGradient
              colors={["transparent", "rgba(8,8,16,0.7)", C.void]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={s.heroContent}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeTxt}>🔥 Trending</Text>
              </View>
              <Text style={s.heroTitle} numberOfLines={2}>{hero.title}</Text>
              <View style={s.heroMeta}>
                <Star size={13} color={C.gold} fill={C.gold} />
                <Text style={s.heroScore}>{hero.vote_average.toFixed(1)}</Text>
                <Text style={s.heroDot}>·</Text>
                <Text style={s.heroYear}>{hero.release_date?.slice(0, 4)}</Text>
              </View>
              <Text style={s.heroOverview} numberOfLines={2}>{hero.overview}</Text>
              <View style={s.heroBtn}>
                <Play size={14} color={C.white} fill={C.white} />
                <Text style={s.heroBtnTxt}>View Details</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <Section title="Trending This Week" data={trending} onItem={go} />
        <Section title="Popular Now"         data={popular}  onItem={go} />
        <Section title="Top Rated"           data={top}      onItem={go} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.ember, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 20, fontWeight: "800", color: C.white },
  hero: { height: 480, marginBottom: 28 },
  heroContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 },
  heroBadge: { alignSelf: "flex-start", backgroundColor: C.ember, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  heroBadgeTxt: { color: C.white, fontSize: 11, fontWeight: "700" },
  heroTitle: { fontSize: 28, fontWeight: "800", color: C.white, lineHeight: 34, marginBottom: 8 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  heroScore: { fontSize: 13, color: C.gold, fontWeight: "700" },
  heroDot: { color: C.silver },
  heroYear: { fontSize: 13, color: C.silver },
  heroOverview: { fontSize: 13, color: C.silverLt, lineHeight: 20, marginBottom: 14 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.ember, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, alignSelf: "flex-start", shadowColor: C.ember, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8 },
  heroBtnTxt: { color: C.white, fontWeight: "700", fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: C.white, paddingHorizontal: 16, marginBottom: 12 },
  card: { width: 128, height: 192, borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  cardImg: { width: "100%", height: "100%" },
  cardGrad: { ...StyleSheet.absoluteFillObject, top: "50%" },
  badge: { position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(8,8,16,0.88)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  badgeScore: { fontSize: 10, color: C.gold, fontWeight: "700" },
  cardFoot: { position: "absolute", bottom: 8, left: 8, right: 8 },
  cardTitle: { fontSize: 11, color: C.white, fontWeight: "700" },
  cardYear: { fontSize: 10, color: C.silver, marginTop: 2 },
});
