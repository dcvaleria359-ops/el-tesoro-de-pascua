import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/src/components/ActionButton";
import { CelebrationOverlay } from "@/src/components/CelebrationOverlay";
import { MediaStage } from "@/src/components/MediaStage";
import { useHunt } from "@/src/context/HuntProvider";
import {
  finalPlaceholderImage,
  finalVideoUrl,
  TOTAL_HOTSPOTS,
} from "@/src/huntConfig";

export default function FinalScreen() {
  const { getFirstPlayableZone, isLoading, progress, resetProgress } = useHunt();
  const zoneRoute = (zoneId: number) => `/zone/${zoneId}`;

  useEffect(() => {
    if (!isLoading && !progress.completedZones.includes(4)) {
      router.replace(zoneRoute(getFirstPlayableZone()) as never);
    }
  }, [getFirstPlayableZone, isLoading, progress.completedZones]);

  const foundCount = Object.values(progress.foundHotspots).reduce(
    (count, hotspots) => count + hotspots.length,
    0,
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#EF476F" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MediaStage
        eyebrow="Gran final"
        fallbackImage={finalPlaceholderImage}
        mediaSource={finalVideoUrl}
        subtitle={`Descubriste ${foundCount}/${TOTAL_HOTSPOTS} estrellas. ¡Ya puedes celebrar con confeti!`}
        title="¡Misión cumplida!"
      >
        <View style={styles.card}>
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>¡Bravo, explorador!</Text>
            <Text style={styles.messageBody}>
              Terminaste las 4 zonas. Sustituye el vídeo final cuando quieras y la experiencia quedará lista para jugar en familia.
            </Text>
          </View>

          <ActionButton
            label="Volver a jugar"
            onPress={async () => {
              await resetProgress();
              router.replace("/");
            }}
            testID="play-again-button"
          />
          <ActionButton
            label="Repasar la zona 4"
            onPress={() => router.replace(zoneRoute(4) as never)}
            testID="review-zone-four-button"
            variant="ghost"
          />
        </View>
      </MediaStage>

      <CelebrationOverlay visible />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: "center",
    backgroundColor: "#0A1024",
    flex: 1,
    justifyContent: "center",
  },
  card: {
    gap: 14,
  },
  messageCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 28,
    gap: 10,
    padding: 20,
  },
  messageTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  messageBody: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    lineHeight: 22,
  },
});