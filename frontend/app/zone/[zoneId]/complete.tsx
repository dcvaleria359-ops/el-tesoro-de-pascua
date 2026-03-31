import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ResizeMode, Video } from "expo-av";

import { ActionButton } from "@/src/components/ActionButton";
import { MediaStage } from "@/src/components/MediaStage";
import { useHunt } from "@/src/context/HuntProvider";
import { getZoneById } from "@/src/huntConfig";
import { loadZoneLayout } from "@/src/storage/hotspotOverrides";

const zoneOneCompletionSource = require("../../../assets/videos/zona1_end.mp4");
const zoneTwoCompletionSource = require("../../../assets/videos/zona2_end.mp4");

export default function ZoneCompleteScreen() {
  const params = useLocalSearchParams<{ edit?: string; zoneId: string }>();
  const zoneId = Number(params.zoneId);
  const zone = getZoneById(zoneId);
  const { getFirstPlayableZone, getFoundHotspots, isEditModeEnabled, isLoading } = useHunt();

  const isEditMode = params.edit === "1" || isEditModeEnabled;
  const [requiredHotspotCount, setRequiredHotspotCount] = useState(zone?.hotspots.length ?? 4);
  const [didFinish, setDidFinish] = useState(false);

  const zoneRoute = (targetZone: number) =>
    isEditMode ? `/zone/${targetZone}?edit=1` : `/zone/${targetZone}`;

  useEffect(() => {
    let isMounted = true;

    if (!zone) {
      return;
    }

    loadZoneLayout(zoneId, zone.hotspots).then((result) => {
      if (isMounted) {
        setRequiredHotspotCount(result.hotspots.length);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [zone, zoneId]);

  useEffect(() => {
    if (!isLoading && (!zone || getFoundHotspots(zoneId).length < requiredHotspotCount)) {
      router.replace(zoneRoute(getFirstPlayableZone()) as never);
    }
  }, [getFirstPlayableZone, getFoundHotspots, isLoading, requiredHotspotCount, zone, zoneId]);

  if (isLoading || !zone) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#EF476F" size="large" />
      </View>
    );
  }

  if ((zone.id === 1 || zone.id === 2) && zone.completionVideoUrl) {
    const videoSource = zone.id === 1 ? zoneOneCompletionSource : zoneTwoCompletionSource;

    return (
      <View style={styles.videoContainer}>
        {zone.id === 1 ? (
          <View style={styles.debugLabel}>
            <Text style={styles.debugLabelText}>COMPLETE ZONE 1: zona1_end.mp4</Text>
          </View>
        ) : null}
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
          <View style={styles.videoFooter}>
            <ActionButton
              label={zone.nextLabel}
              onPress={() => router.replace(zoneRoute(zoneId + 1) as never)}
              size="hero"
              testID="next-zone-button"
            />
          </View>
        ) : null}
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
            Has encontrado todos los hotspots de esta zona. El siguiente botón mantiene el flujo lineal de la caza.
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
  videoContainer: {
    backgroundColor: "#000000",
    flex: 1,
    justifyContent: "flex-end",
  },
  debugLabel: {
    backgroundColor: "rgba(10,16,36,0.78)",
    borderRadius: 999,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "absolute",
    top: 18,
    zIndex: 2,
  },
  debugLabelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  video: {
    backgroundColor: "#000000",
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  videoFooter: {
    backgroundColor: "rgba(0,0,0,0.32)",
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
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