import { router } from "expo-router";
import { useEffect } from "react";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ResizeMode, Video } from "expo-av";

import { ActionButton } from "@/src/components/ActionButton";
import { useHunt } from "@/src/context/HuntProvider";
import { finalVideoUrl } from "@/src/huntConfig";

export default function FinalScreen() {
  const { getFirstPlayableZone, isLoading, progress, resetProgress } = useHunt();
  const [didFinish, setDidFinish] = useState(false);
  const zoneRoute = (zoneId: number) => `/zone/${zoneId}`;

  useEffect(() => {
    if (!isLoading && !progress.completedZones.includes(4)) {
      router.replace(zoneRoute(getFirstPlayableZone()) as never);
    }
  }, [getFirstPlayableZone, isLoading, progress.completedZones]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#EF476F" size="large" />
      </View>
    );
  }

  const videoSource =
    typeof finalVideoUrl === "string" ? { uri: finalVideoUrl } : finalVideoUrl;

  if (!videoSource) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#EF476F" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      {didFinish ? (
        <View style={styles.footer}>
          <ActionButton
            label="VOLVER AL INICIO"
            onPress={async () => {
              await resetProgress();
              router.replace("/");
            }}
            size="hero"
            testID="play-again-button"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000000",
    flex: 1,
  },
  loading: {
    alignItems: "center",
    backgroundColor: "#0A1024",
    flex: 1,
    justifyContent: "center",
  },
  video: {
    backgroundColor: "#000000",
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  footer: {
    backgroundColor: "rgba(0,0,0,0.32)",
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});