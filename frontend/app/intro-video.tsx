import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionButton } from "@/src/components/ActionButton";
import { useHunt } from "@/src/context/HuntProvider";
import { introVideoUrl, startPlaceholderImage } from "@/src/huntConfig";

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
  const fallbackImage = toSource(startPlaceholderImage);

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
          {videoSource ? (
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
              useNativeControls
            />
          ) : (
            <View style={styles.placeholderWrap}>
              <Image
                resizeMode="contain"
                source={fallbackImage}
                style={styles.placeholderImage}
              />
              <Text style={styles.placeholderText}>
                Add `frontend/assets/videos/intro.mp4` to play the intro video here.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.overlayFooter}>
          <ActionButton
            label="A BUSCAR LOS TESOROS"
            onPress={handleContinue}
            size="hero"
            testID="go-to-zone-one-button"
          />
          <Text style={styles.footerNote}>
            {didFinish
              ? "La presentación terminó. Ya puedes empezar la búsqueda."
              : "La presentación puede verse completa o continuar cuando quieras."}
          </Text>
        </View>
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
  placeholderWrap: {
    alignItems: "center",
    gap: 18,
    justifyContent: "center",
    paddingHorizontal: 28,
    width: "100%",
  },
  placeholderImage: {
    height: "78%",
    width: "100%",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
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