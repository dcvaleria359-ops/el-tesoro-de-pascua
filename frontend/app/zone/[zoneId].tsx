import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ActionButton } from "@/src/components/ActionButton";
import { HotspotMap } from "@/src/components/HotspotMap";
import { useHunt } from "@/src/context/HuntProvider";
import { getZoneById } from "@/src/huntConfig";

type DraftHotspot = {
  id: string;
  x: number;
  y: number;
};

export default function ZoneScreen() {
  const params = useLocalSearchParams<{ edit?: string; zoneId: string }>();
  const zoneId = Number(params.zoneId);
  const isEditMode = params.edit === "1";
  const zone = getZoneById(zoneId);

  const {
    getFirstPlayableZone,
    getFoundHotspots,
    isLoading,
    isZoneUnlocked,
    markHotspot,
    resetProgress,
    startHunt,
  } = useHunt();

  const [draftHotspots, setDraftHotspots] = useState<DraftHotspot[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const foundHotspots = useMemo(
    () => getFoundHotspots(zoneId),
    [getFoundHotspots, zoneId],
  );

  const remaining = zone ? zone.hotspots.length - foundHotspots.length : 0;
  const zoneRoute = (targetZone: number) =>
    isEditMode ? `/zone/${targetZone}?edit=1` : `/zone/${targetZone}`;
  const completeRoute = (targetZone: number) =>
    isEditMode
      ? `/zone/${targetZone}/complete?edit=1`
      : `/zone/${targetZone}/complete`;

  useEffect(() => {
    void startHunt();
  }, [startHunt]);

  useEffect(() => {
    if (!isLoading && !zone) {
      router.replace("/");
    }
  }, [isLoading, zone]);

  useEffect(() => {
    if (!isLoading && zone && !isZoneUnlocked(zoneId)) {
      router.replace(zoneRoute(getFirstPlayableZone()) as never);
    }
  }, [getFirstPlayableZone, isLoading, isZoneUnlocked, zone, zoneId]);

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 1200);
  };

  if (isLoading || !zone) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#EF476F" size="large" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <View style={styles.container}>
          <HotspotMap
            foundHotspots={foundHotspots}
            isEditMode={isEditMode}
            onHotspotPress={async (hotspotId) => {
              const result = await markHotspot(zoneId, hotspotId);

              if (!result.added) {
                return;
              }

              try {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              } catch {}

              const message = result.completed
                ? "¡Zona completa!"
                : `¡BRAVO! Te faltan ${result.remaining}`;

              showFeedback(message);

              if (result.completed) {
                setTimeout(() => {
                  router.replace(
                    zoneId === 4
                      ? ("/final" as never)
                      : (completeRoute(zoneId) as never),
                  );
                }, 950);
              }
            }}
            onMapTap={(x, y) => {
              if (!isEditMode) {
                return;
              }

              setDraftHotspots((current) => [
                ...current.slice(-3),
                { id: `draft-${Date.now()}`, x, y },
              ]);
              showFeedback(`x ${x}% · y ${y}%`);
            }}
            previewHotspots={draftHotspots}
            zone={zone}
          />

          <View style={styles.topCard}>
            <View>
              <Text style={styles.zoneTitle}>{zone.title}</Text>
              <Text style={styles.zoneSubtitle}>{zone.subtitle}</Text>
            </View>

            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {foundHotspots.length}/{zone.hotspots.length}
              </Text>
            </View>
          </View>

          {feedback ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}

          <View style={styles.bottomCard}>
            <Text style={styles.remainingText}>
              {remaining > 0
                ? `Te faltan ${remaining} estrella${remaining === 1 ? "" : "s"}.`
                : "Todo encontrado. ¡Prepárate para continuar!"}
            </Text>

            {isEditMode ? (
              <View style={styles.editCard}>
                <Text style={styles.editTitle}>Modo edición</Text>
                <Text style={styles.editBody}>
                  Toca el mapa para capturar coordenadas rápidas en porcentaje.
                </Text>
                {draftHotspots
                  .slice()
                  .reverse()
                  .map((hotspot) => (
                    <Text key={hotspot.id} style={styles.editCode}>
                      x: {hotspot.x.toFixed(1)} · y: {hotspot.y.toFixed(1)}
                    </Text>
                  ))}
              </View>
            ) : null}

            <View style={styles.actions}>
              <ActionButton
                label="Inicio"
                onPress={() => router.replace("/")}
                style={styles.actionButton}
                testID="home-button"
                variant="ghost"
              />
              <ActionButton
                label="Reiniciar"
                onPress={async () => {
                  await resetProgress();
                  router.replace("/");
                }}
                style={styles.actionButton}
                testID="reset-zone-button"
                variant="subtle"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  container: {
    backgroundColor: "#F8F9FA",
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loading: {
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    flex: 1,
    justifyContent: "center",
  },
  topCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(10,16,36,0.64)",
    borderRadius: 24,
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
    left: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: "absolute",
    right: 20,
    top: 28,
  },
  zoneTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },
  zoneSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
  },
  counterPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  feedbackCard: {
    alignSelf: "center",
    backgroundColor: "rgba(239,71,111,0.94)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "absolute",
    top: 116,
  },
  feedbackText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  bottomCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    bottom: 20,
    gap: 14,
    left: 20,
    padding: 18,
    position: "absolute",
    right: 20,
  },
  remainingText: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "700",
  },
  editCard: {
    backgroundColor: "#0A1024",
    borderRadius: 20,
    gap: 6,
    padding: 14,
  },
  editTitle: {
    color: "#FFD166",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  editBody: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 18,
  },
  editCode: {
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});