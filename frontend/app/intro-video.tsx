import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionButton } from "@/src/components/ActionButton";
import { useHunt } from "@/src/context/HuntProvider";
import { introVideoUrl } from "@/src/huntConfig";

const toSource = (source: number | string | null) => {
  if (!source) {
    return undefined;
  }

  return typeof source === "string" ? { uri: source } : source;
};

export default function IntroVideoScreen() {
  const { isLoading, startHunt } = useHunt();
  const [didFinish, setDidFinish] = useState(false);

  const videoSource = toSource(introVideoUrl);

  const handleContinue = async () => {
    await startHunt();
    router.replace("/zone/1" as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.videoFrame}>
          <Video
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                setDidFinish(true);
              }
            }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            source={videoSource}
            style={styles.video}
            useNativeControls={false}
          />
        </View>

        {didFinish ? (
          <View style={styles.overlayFooter}>
            <ActionButton
              label="A BUSCAR LOS TESOROS"
              onPress={handleContinue}
              size="hero"
              testID="go-to-zone-one-button"
            />
            <Text style={styles.footerNote}>
              La presentación terminó. Ya puedes empezar la búsqueda.
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000000",
    flex: 1,
  },
  container: {
    backgroundColor: "#000000",
    flex: 1,
    justifyContent: "space-between",
  },
  loading: {
    alignItems: "center",
    backgroundColor: "#000000",
    flex: 1,
    justifyContent: "center",
  },
  videoFrame: {
    alignItems: "center",
    backgroundColor: "#000000",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  video: {
    backgroundColor: "#000000",
    height: "100%",
    width: "100%",
  },
  overlayFooter: {
    backgroundColor: "rgba(0,0,0,0.38)",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  footerNote: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    textAlign: "center",
  },
});