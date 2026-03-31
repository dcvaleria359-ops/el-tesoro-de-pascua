import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/src/components/ActionButton";
import { MediaStage } from "@/src/components/MediaStage";
import { useHunt } from "@/src/context/HuntProvider";
import {
  getZoneById,
  startPlaceholderImage,
  startVideoUrl,
} from "@/src/huntConfig";

export default function Index() {
  const { getFirstPlayableZone, isLoading, progress, resetProgress, startHunt } =
    useHunt();

  const nextZone = getZoneById(getFirstPlayableZone());
  const hasProgress =
    Boolean(progress.startedAt) || progress.completedZones.length > 0;

  const startRoute = async () => {
    await startHunt();
    router.replace(`/zone/${nextZone?.id ?? 1}` as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#EF476F" size="large" />
      </View>
    );
  }

  return (
    <MediaStage
      autoPlay
      eyebrow="Aventura familiar"
      fallbackImage={startPlaceholderImage}
      gradientOverlay
      isLooping
      mediaSource={startVideoUrl}
      showPlayButton
      subtitle="Recorre las 4 zonas, encuentra las 16 estrellas escondidas y desbloquea el final sorpresa."
      title="LOS TESOROS DE PASCUA"
    >
      <View style={styles.card}>
        {hasProgress ? (
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              Continúas en la zona {nextZone?.id ?? 1}
            </Text>
          </View>
        ) : null}

        <ActionButton
          label="¡EMPEZAR!"
          onPress={startRoute}
          size="hero"
          testID="start-button"
        />

        {hasProgress ? (
          <ActionButton
            label="Reiniciar progreso"
            onPress={async () => {
              await resetProgress();
            }}
            testID="reset-progress-button"
            variant="subtle"
          />
        ) : null}
      </View>
    </MediaStage>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: "#0A1024",
    flex: 1,
    justifyContent: "center",
  },
  card: {
    gap: 12,
    width: "100%",
  },
  progressPill: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
