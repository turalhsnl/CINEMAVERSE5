import { useState } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Search, X, Star } from "lucide-react-native";
import { C, imgUrl, tmdbGet } from "../../src/lib/theme";

interface Movie {
  id: number; title: string; poster_path: string | null;
  vote_average: number; release_date: string; overview: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const [q, setQ]               = useState("");
  const [results, setResults]   = useState<Movie[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async (text: string) => {
    if (!text.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const r = await tmdbGet<{ results: Movie[]; total_results: number }>(
        "/search/movie", { query: text }
      );
      setResults(r.results); setTotal(r.total_results);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.wrap} edges={["top"]}>
      <Text style={s.title}>Search</Text>

      <View style={s.inputRow}>
        <Search size={15} color={C.silver} />
        <TextInput
          style={s.input}
          placeholder="Search movies…"
          placeholderTextColor={C.silver + "60"}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => runSearch(q)}
          returnKeyType="search"
          autoCorrect={false}
        />
        {q.length > 0 && (
          <TouchableOpacity onPress={() => { setQ(""); setResults([]); setSearched(false); }}>
            <X size={15} color={C.silver} />
          </TouchableOpacity>
        )}
      </View>

      {!searched ? (
        <View style={s.empty}>
          <Search size={50} color={C.silver} opacity={0.15} />
          <Text style={s.emptyTxt}>Search for any movie</Text>
        </View>
      ) : loading ? (
        <View style={s.empty}><ActivityIndicator size="large" color={C.ember} /></View>
      ) : results.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyTxt}>No results for "{q}"</Text></View>
      ) : (
        <>
          <Text style={s.count}>{total.toLocaleString()} movies found</Text>
          <FlatList
            data={results}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.row}
                onPress={() => router.push(`/movie/${item.id}` as never)}
                activeOpacity={0.75}
              >
                <Image
                  source={{ uri: imgUrl(item.poster_path, "w200") }}
                  style={s.rowImg} contentFit="cover"
                />
                <View style={s.rowInfo}>
                  <Text style={s.rowTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={s.rowMeta}>
                    <Star size={11} color={C.gold} fill={C.gold} />
                    <Text style={s.rowScore}>{item.vote_average.toFixed(1)}</Text>
                    <Text style={s.rowDot}>·</Text>
                    <Text style={s.rowYear}>{item.release_date?.slice(0, 4)}</Text>
                  </View>
                  <Text style={s.rowOverview} numberOfLines={2}>{item.overview}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.void },
  title: { fontSize: 26, fontWeight: "800", color: C.white, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: C.void100, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  input: { flex: 1, color: C.white, fontSize: 15 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTxt: { color: C.silver, fontSize: 15 },
  count: { color: C.silver, fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
  row: { flexDirection: "row", gap: 12, backgroundColor: C.void100, borderRadius: 16, overflow: "hidden" },
  rowImg: { width: 80, height: 120 },
  rowInfo: { flex: 1, padding: 12, justifyContent: "center" },
  rowTitle: { fontSize: 15, fontWeight: "700", color: C.white, marginBottom: 4 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 },
  rowScore: { fontSize: 12, color: C.gold, fontWeight: "700" },
  rowDot: { color: C.silver },
  rowYear: { fontSize: 12, color: C.silver },
  rowOverview: { fontSize: 12, color: C.silver, lineHeight: 17 },
});
