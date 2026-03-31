import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/src/components/ActionButton";
import { MediaStage } from "@/src/components/MediaStage";
import { useHunt } from "@/src/context/HuntProvider";
import { getZoneById } from "@/src/huntConfig";

export default function ZoneCompleteScreen() {
  const params = useLocalSearchParams<{ edit?: string; zoneId: string }>();
  const zoneId = Number(params.zoneId);
  const zone = getZoneById(zoneId);
  const { getFirstPlayableZone, getFoundHotspots, isEditModeEnabled, isLoading } = useHunt();

  const isEditMode = params.edit === "1" || isEditModeEnabled;

  const zoneRoute = (targetZone: number) =>
    isEditMode ? `/zone/${targetZone}?edit=1` : `/zone/${targetZone}`;

  useEffect(() => {
    if (!isLoading && (!zone || getFoundHotspots(zoneId).length < (zone?.hotspots.length ?? 4))) {
      router.replace(zoneRoute(getFirstPlayableZone()) as never);
    }
  }, [getFirstPlayableZone, getFoundHotspots, isLoading, zone, zoneId]);

  if (isLoading || !zone) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#EF476F" size="large" />
      </View>
    );
  }

  return (
    <MediaStage
      eyebrow={zone.title}
      fallbackImage={zone.mapImage}
      mediaSource={zone.completionVideoUrl}
      subtitle="Sustituye este vídeo cuando tengas el MP4 final de la zona."
      title="¡Zona superada!"
    >
      <View style={styles.card}>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>¡Excelente trabajo!</Text>
          <Text style={styles.messageBody}>
            Has encontrado las 4 estrellas. El siguiente botón mantiene el flujo lineal de la caza.
          </Text>
        </View>

        <ActionButton
          label={zone.nextLabel}
          onPress={() => router.replace(zoneRoute(zoneId + 1) as never)}
          testID="next-zone-button"
        />
        <ActionButton
          label="Volver al mapa"
          onPress={() => router.replace(zoneRoute(zoneId) as never)}
          testID="back-to-map-button"
          variant="ghost"
        />
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