import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Wallet, LogOut, Film, Heart, Bookmark } from "lucide-react-native";
import { useAuthStore, type SavedMovie } from "../../src/lib/store";
import { C, imgUrl } from "../../src/lib/theme";

type Tab = "liked" | "watchlist";

/* ─── Saved movie grid ──────────────────────────────────────────────────── */
function MovieGrid({ movies }: { movies: SavedMovie[] }) {
  const router = useRouter();
  if (!movies.length) return (
    <View style={g.empty}>
      <Text style={g.emptyTxt}>Nothing saved yet</Text>
      <Text style={g.emptySub}>Browse movies and tap Like or Save to build your collection</Text>
    </View>
  );
  return (
    <FlatList
      data={movies}
      numColumns={3}
      keyExtractor={m => String(m.id)}
      scrollEnabled={false}
      columnWrapperStyle={{ gap:10 }}
      ItemSeparatorComponent={() => <View style={{ height:10 }}/>}
      renderItem={({ item }) => (
        <TouchableOpacity style={g.card} onPress={() => router.push(`/movie/${item.id}` as never)} activeOpacity={0.8}>
          <Image source={{ uri:imgUrl(item.poster_path,"w200") }} style={StyleSheet.absoluteFillObject} contentFit="cover"/>
          <LinearGradient colors={["transparent","rgba(8,8,16,0.85)"]} style={StyleSheet.absoluteFillObject}/>
          <View style={g.cardFoot}>
            <Text style={g.cardTitle} numberOfLines={1}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
const g = StyleSheet.create({
  empty: { paddingVertical:40, alignItems:"center", gap:8 },
  emptyTxt: { fontSize:16, color:C.silver, fontWeight:"600" },
  emptySub: { fontSize:12, color:C.silver, opacity:0.5, textAlign:"center", paddingHorizontal:20 },
  card: { flex:1, aspectRatio:2/3, borderRadius:12, overflow:"hidden" },
  cardFoot: { position:"absolute", bottom:0, left:0, right:0, padding:6 },
  cardTitle: { fontSize:10, color:C.white, fontWeight:"700" },
});

/* ─── Not signed in ─────────────────────────────────────────────────────── */
function ConnectScreen() {
  const { connectWallet, isLoading, error, clearError } = useAuthStore();
  const [address, setAddress]   = useState("");
  const [username, setUsername] = useState("");
  const [step, setStep]         = useState<"address"|"username">("address");

  const next = () => {
    if (!address.trim().startsWith("0x") || address.trim().length < 42) {
      Alert.alert("Invalid Address", "Enter a valid Ethereum address (0x… 42 chars)");
      return;
    }
    setStep("username");
  };

  const finish = async () => { clearError(); await connectWallet(address.trim(), username.trim() || undefined); };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.void }} edges={["top"]}>
      <ScrollView contentContainerStyle={s.connectWrap} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[C.ember, C.emberDark]} style={s.icon}>
          <Film size={38} color={C.white}/>
        </LinearGradient>
        <Text style={s.brand}>Cinema<Text style={{ color:C.ember }}>Verse</Text></Text>

        {step === "address" ? (
          <>
            <Text style={s.heading}>Connect Your Wallet</Text>
            <Text style={s.sub}>Enter your Ethereum address to sign in and save movies</Text>
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>WALLET ADDRESS</Text>
              <View style={s.fieldRow}>
                <Wallet size={15} color={C.silver}/>
                <TextInput style={s.fieldInput} placeholder="0x..." placeholderTextColor={C.silver+"70"}
                  value={address} onChangeText={setAddress} autoCapitalize="none" autoCorrect={false}/>
              </View>
            </View>
            <View style={s.steps}>
              {["Enter wallet address","Verify ownership","Save movies & build your list"].map((t,i) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepNum}><Text style={s.stepNumTxt}>{i+1}</Text></View>
                  <Text style={s.stepTxt}>{t}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={next} activeOpacity={0.85}>
              <LinearGradient colors={[C.ember, C.emberDark]} style={s.btn} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={s.btnTxt}>Continue →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.heading}>Choose a Username</Text>
            <Text style={s.sub}>Optional — leave blank to use your wallet address</Text>
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>USERNAME (OPTIONAL)</Text>
              <View style={s.fieldRow}>
                <TextInput style={s.fieldInput} placeholder="e.g. CinephileMax"
                  placeholderTextColor={C.silver+"70"} value={username}
                  onChangeText={setUsername} maxLength={32}/>
              </View>
            </View>
            {error ? <View style={s.errBox}><Text style={s.errTxt}>{error}</Text></View> : null}
            <TouchableOpacity onPress={finish} disabled={isLoading} activeOpacity={0.85}>
              <LinearGradient colors={[C.ember, C.emberDark]} style={s.btn} start={{x:0,y:0}} end={{x:1,y:0}}>
                {isLoading ? <ActivityIndicator color={C.white}/> : <Text style={s.btnTxt}>Enter CinemaVerse 🎬</Text>}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep("address")} style={{ marginTop:14 }}>
              <Text style={{ color:C.ember, fontSize:13, textAlign:"center" }}>← Back</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Signed in ─────────────────────────────────────────────────────────── */
function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>("liked");

  const short = user?.walletAddress
    ? `${user.walletAddress.slice(0,8)}…${user.walletAddress.slice(-6)}`
    : "";

  const confirmLogout = () =>
    Alert.alert("Disconnect", "Sign out of CinemaVerse?", [
      { text:"Cancel", style:"cancel" },
      { text:"Disconnect", style:"destructive", onPress:() => logout() },
    ]);

  const liked     = user?.liked     ?? [];
  const watchlist = user?.watchlist ?? [];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.void }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:100 }}>
        {/* Avatar */}
        <View style={s.profileCard}>
          <LinearGradient colors={[C.ember,"#c87d00"]} style={s.avatar}>
            <Text style={s.avatarTxt}>{(user?.username??"A").slice(0,1).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={s.profileName}>{user?.username ?? "Anonymous"}</Text>
          <View style={s.walletRow}>
            <Wallet size={13} color={C.ember}/>
            <Text style={s.walletTxt}>{short}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {([
            [<Film size={18} color={C.ember}/>,     String(liked.length+watchlist.length), "Saved"],
            [<Heart size={18} color="#f87171"/>,    String(liked.length),                  "Liked"],
            [<Bookmark size={18} color={C.ember}/>, String(watchlist.length),              "Watchlist"],
          ] as const).map(([icon, val, lbl], i) => (
            <View key={i} style={s.statCard}>
              {icon}
              <Text style={s.statVal}>{val}</Text>
              <Text style={s.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {([["liked","❤️ Liked",liked.length],["watchlist","🔖 Watchlist",watchlist.length]] as const).map(([key,label,count]) => (
            <TouchableOpacity key={key} style={[s.tabBtn, tab===key && s.tabBtnActive]} onPress={() => setTab(key)}>
              <Text style={[s.tabTxt, tab===key && s.tabTxtActive]}>{label}</Text>
              <View style={s.tabBadge}><Text style={s.tabBadgeTxt}>{count}</Text></View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal:16 }}>
          <MovieGrid movies={tab==="liked" ? liked : watchlist} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout}>
          <LogOut size={15} color={C.error}/>
          <Text style={s.logoutTxt}>Disconnect Wallet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProfileTab() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <ProfileScreen/> : <ConnectScreen/>;
}

const s = StyleSheet.create({
  connectWrap: { alignItems:"center", padding:24, paddingTop:40 },
  icon: { width:84, height:84, borderRadius:24, alignItems:"center", justifyContent:"center", marginBottom:14, shadowColor:C.ember, shadowOffset:{width:0,height:8}, shadowOpacity:0.45, shadowRadius:20, elevation:10 },
  brand: { fontSize:24, fontWeight:"800", color:C.white, marginBottom:32 },
  heading: { fontSize:24, fontWeight:"800", color:C.white, textAlign:"center", marginBottom:6 },
  sub: { fontSize:13, color:C.silver, textAlign:"center", lineHeight:20, marginBottom:24, paddingHorizontal:12 },
  fieldWrap: { width:"100%", marginBottom:20 },
  fieldLabel: { fontSize:11, color:C.silver+"90", fontWeight:"700", letterSpacing:1, marginBottom:6 },
  fieldRow: { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:C.void100, borderRadius:16, paddingHorizontal:14, paddingVertical:14, borderWidth:1, borderColor:"rgba(255,255,255,0.08)" },
  fieldInput: { flex:1, color:C.white, fontSize:15 },
  steps: { width:"100%", gap:10, marginBottom:24 },
  stepRow: { flexDirection:"row", alignItems:"center", gap:12 },
  stepNum: { width:24, height:24, borderRadius:99, backgroundColor:"rgba(255,107,44,0.14)", alignItems:"center", justifyContent:"center" },
  stepNumTxt: { fontSize:11, color:C.ember, fontWeight:"700" },
  stepTxt: { fontSize:13, color:C.silver },
  btn: { width:300, height:52, borderRadius:16, alignItems:"center", justifyContent:"center", shadowColor:C.ember, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:18, elevation:8 },
  btnTxt: { color:C.white, fontSize:15, fontWeight:"700" },
  errBox: { width:"100%", backgroundColor:"rgba(239,68,68,0.1)", borderRadius:14, padding:12, marginBottom:14 },
  errTxt: { color:C.error, fontSize:13 },
  profileCard: { alignItems:"center", padding:24, paddingTop:16 },
  avatar: { width:80, height:80, borderRadius:22, alignItems:"center", justifyContent:"center", marginBottom:10, shadowColor:C.ember, shadowOffset:{width:0,height:8}, shadowOpacity:0.4, shadowRadius:18, elevation:8 },
  avatarTxt: { fontSize:34, fontWeight:"800", color:C.white },
  profileName: { fontSize:22, fontWeight:"800", color:C.white, marginBottom:4 },
  walletRow: { flexDirection:"row", alignItems:"center", gap:6 },
  walletTxt: { fontSize:12, color:C.silver },
  statsRow: { flexDirection:"row", gap:10, paddingHorizontal:16, marginBottom:20 },
  statCard: { flex:1, backgroundColor:C.void100, borderRadius:16, padding:12, alignItems:"center", gap:4, borderWidth:1, borderColor:"rgba(255,255,255,0.06)" },
  statVal: { fontSize:22, fontWeight:"800", color:C.white },
  statLbl: { fontSize:10, color:C.silver },
  tabRow: { flexDirection:"row", gap:8, paddingHorizontal:16, marginBottom:16 },
  tabBtn: { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6, paddingVertical:11, borderRadius:14, backgroundColor:C.void100, borderWidth:1, borderColor:"rgba(255,255,255,0.07)" },
  tabBtnActive: { backgroundColor:"rgba(255,107,44,0.13)", borderColor:"rgba(255,107,44,0.35)" },
  tabTxt: { fontSize:13, color:C.silver, fontWeight:"600" },
  tabTxtActive: { color:C.ember },
  tabBadge: { backgroundColor:"rgba(255,255,255,0.08)", borderRadius:99, paddingHorizontal:6, paddingVertical:2 },
  tabBadgeTxt: { fontSize:10, color:C.silver, fontWeight:"700" },
  logoutBtn: { flexDirection:"row", alignItems:"center", gap:10, marginHorizontal:16, marginTop:24, padding:14, borderRadius:16, borderWidth:1, borderColor:"rgba(239,68,68,0.2)" },
  logoutTxt: { color:C.error, fontSize:13, fontWeight:"600" },
});
