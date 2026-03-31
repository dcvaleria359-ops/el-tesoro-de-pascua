import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HuntProvider } from "@/src/context/HuntProvider";
import { Platform, View } from "react-native";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HuntProvider>
          <StatusBar style="dark" />
          <View
            style={{
              flex: 1,
              width: Platform.OS === "web" ? 390 : "100%",
              maxWidth: 390,
              alignSelf: "center",
              overflow: "hidden",
            }}
          >
            <Stack
              screenOptions={{
                animation: "fade_from_bottom",
                contentStyle: { backgroundColor: "#F8F9FA" },
                headerShown: false,
              }}
            />
          </View>
        </HuntProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
