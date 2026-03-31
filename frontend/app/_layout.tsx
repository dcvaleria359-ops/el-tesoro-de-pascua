import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { HuntProvider } from "@/src/context/HuntProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HuntProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              animation: "fade_from_bottom",
              contentStyle: { backgroundColor: "#F8F9FA" },
              headerShown: false,
            }}
          />
        </HuntProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}