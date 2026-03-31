import { router, useLocalSearchParams, usePathname } from "expo-router";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/src/components/ActionButton";
import { MediaStage } from "@/src/components/MediaStage";
import { useHunt } from "@/src/context/HuntProvider";
import {
  getZoneById,
  startPlaceholderImage,
  startVideoUrl,
} from "@/src/huntConfig";

const buildEditRoute = (
  pathname: string,
  params: Record<string, string | string[] | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value || key === "edit") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      return;
    }

    searchParams.set(key, value);
  });

  searchParams.set("edit", "1");
  return `${pathname}?${searchParams.toString()}`;
};

export default function Index() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ edit?: string }>();
  const {
    enableEditMode,
    getFirstPlayableZone,
    isEditModeEnabled,
    isLoading,
    progress,
    resetProgress,
    startHunt,
  } = useHunt();

  const nextZone = getZoneById(getFirstPlayableZone());
  const hasProgress =
    Boolean(progress.startedAt) || progress.completedZones.length > 0;
  const isEditMode = params.edit === "1" || isEditModeEnabled;

  const startRoute = async () => {
    await startHunt();
    router.replace((isEditMode ? "/intro-video?edit=1" : "/intro-video") as never);
  };

  const openEditMode = () => {
    if (Platform.OS === "web") {
      router.replace(buildEditRoute(pathname, params) as never);
      return;
    }

    router.push("/edit-mode" as never);
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

        <Pressable onPress={openEditMode} style={styles.editLinkWrap}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
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
  editLinkWrap: {
    alignItems: "center",
    marginTop: 4,
  },
  editLink: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "500",
    textDecorationLine: "underline",
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
