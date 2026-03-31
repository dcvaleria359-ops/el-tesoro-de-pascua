import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionButton } from "@/src/components/ActionButton";
import { useHunt } from "@/src/context/HuntProvider";

export default function EditModeScreen() {
  const { enableEditMode } = useHunt();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit mode</Text>
          <Text style={styles.body}>
            Enable edit mode to tap zone images, see xPercent/yPercent, copy them,
            and review existing hotspot coordinates.
          </Text>

          <ActionButton
            label="Enable edit mode"
            onPress={() => {
              enableEditMode();
              router.replace("/" as never);
            }}
            testID="enable-edit-mode-button"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0A1024",
    flex: 1,
  },
  container: {
    alignItems: "center",
    backgroundColor: "#0A1024",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 28,
    gap: 14,
    padding: 22,
    width: "100%",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  body: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 15,
    lineHeight: 22,
  },
});