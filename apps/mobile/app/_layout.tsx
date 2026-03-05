import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/lib/store";

export default function RootLayout() {
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#080810" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#080810" },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="movie/[id]"
            options={{ animation: "slide_from_right" }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
