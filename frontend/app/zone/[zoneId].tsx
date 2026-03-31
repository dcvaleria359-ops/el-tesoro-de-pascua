import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ActionButton } from "@/src/components/ActionButton";
import { HotspotMap } from "@/src/components/HotspotMap";
import { useHunt } from "@/src/context/HuntProvider";
import { getZoneById, Hotspot } from "@/src/huntConfig";
import { getStoredHotspots, saveStoredHotspots } from "@/src/storage/hotspotOverrides";

const clampPercent = (value: number) =>
  Number(Math.min(100, Math.max(0, value)).toFixed(1));

const createHotspotId = (zoneId: number, hotspots: Hotspot[]) => {
  const prefix = `z${zoneId}-`;
  const usedSuffixes = new Set(
    hotspots
      .filter((hotspot) => hotspot.id.startsWith(prefix))
      .map((hotspot) => hotspot.id.replace(prefix, "")),
  );

  for (let index = 0; index < 26; index += 1) {
    const suffix = String.fromCharCode(97 + index);
    if (!usedSuffixes.has(suffix)) {
      return `${prefix}${suffix}`;
    }
  }

  return `${prefix}${hotspots.length + 1}`;
};

export default function ZoneScreen() {
  const params = useLocalSearchParams<{ edit?: string; zoneId: string }>();
  const zoneId = Number(params.zoneId);
  const zone = getZoneById(zoneId);

  const {
    getFirstPlayableZone,
    getFoundHotspots,
    isEditModeEnabled,
    isLoading,
    isZoneUnlocked,
    markHotspot,
    resetProgress,
    startHunt,
    toggleEditMode,
  } = useHunt();

  const isEditMode = params.edit === "1" || isEditModeEnabled;

  const [editableHotspots, setEditableHotspots] = useState<Hotspot[]>(
    zone?.hotspots ?? [],
  );
  const [deleteMode, setDeleteMode] = useState(false);
  const [burstingHotspotId, setBurstingHotspotId] = useState<string | null>(
    null,
  );
  const [mapBounds, setMapBounds] = useState({
    height: 0,
    left: 0,
    top: 0,
    width: 0,
  });
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const foundHotspots = useMemo(
    () =>
      getFoundHotspots(zoneId).filter((hotspotId) =>
        editableHotspots.some((hotspot) => hotspot.id === hotspotId),
      ),
    [editableHotspots, getFoundHotspots, zoneId],
  );

  const remaining = Math.max(editableHotspots.length - foundHotspots.length, 0);
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
    let isMounted = true;

    if (!zone) {
      return;
    }

    getStoredHotspots(zone.id, zone.hotspots).then((storedHotspots) => {
      if (isMounted) {
        setEditableHotspots(storedHotspots);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [zone, zoneId]);

  useEffect(() => {
    if (!isEditMode) {
      setDeleteMode(false);
    }
  }, [isEditMode]);

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

  const persistHotspots = async (nextHotspots: Hotspot[]) => {
    if (!zone) {
      return;
    }

    const normalized = nextHotspots.map((hotspot) => ({
      ...hotspot,
      label: hotspot.label || hotspot.id,
      x: clampPercent(hotspot.x),
      y: clampPercent(hotspot.y),
    }));

    setEditableHotspots(normalized);
    await saveStoredHotspots(zone.id, normalized);
  };

  const selectedHotspot = editableHotspots.find(
    (hotspot) => hotspot.id === selectedHotspotId,
  );

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
              const result = await markHotspot(
                zoneId,
                hotspotId,
                editableHotspots.length,
                editableHotspots.map((hotspot) => hotspot.id),
              );

              if (!result.added) {
                return;
              }

              setBurstingHotspotId(hotspotId);
              setTimeout(() => setBurstingHotspotId(null), 650);

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
            onMapTap={async (x, y) => {
              if (!isEditMode) {
                return;
              }

              const copiedValue = `${x.toFixed(1)},${y.toFixed(1)}`;

              await Clipboard.setStringAsync(copiedValue);
              showFeedback(
                `xPercent ${x.toFixed(1)} · yPercent ${y.toFixed(1)}`,
              );
            }}
            burstingHotspotId={burstingHotspotId}
            deleteMode={deleteMode}
            hotspots={editableHotspots}
            onHotspotSelect={setSelectedHotspotId}
            onHotspotDeleteRequest={(hotspotId) => {
              Alert.alert(
                "Delete hotspot?",
                `Remove ${hotspotId} from ${zone.title}?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    style: "destructive",
                    text: "Delete",
                    onPress: () => {
                      const nextHotspots = editableHotspots.filter(
                        (hotspot) => hotspot.id !== hotspotId,
                      );

                      void persistHotspots(nextHotspots);
                      if (selectedHotspotId === hotspotId) {
                        setSelectedHotspotId(null);
                      }
                      showFeedback(`Deleted ${hotspotId}`);
                    },
                  },
                ],
              );
            }}
            onHotspotMoveEnd={(hotspotId, x, y) => {
              const nextHotspots = editableHotspots.map((hotspot) =>
                hotspot.id === hotspotId ? { ...hotspot, x, y } : hotspot,
              );

              void persistHotspots(nextHotspots);
              setSelectedHotspotId(hotspotId);
              showFeedback(`Saved ${hotspotId}: ${x.toFixed(1)},${y.toFixed(1)}`);
            }}
            onMapBoundsChange={setMapBounds}
            zone={zone}
          />

          <View style={styles.topCard}>
            <Pressable
              delayLongPress={2000}
              onLongPress={() => {
                toggleEditMode();
                showFeedback(isEditMode ? "EDIT OFF" : "EDIT ON");
              }}
              style={styles.titleWrap}
            >
              <Text style={styles.zoneTitle}>{zone.title}</Text>
              <Text style={styles.zoneSubtitle}>{zone.subtitle}</Text>
            </Pressable>

            <View style={styles.topRightWrap}>
              {isEditMode ? (
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeText}>EDIT ON</Text>
                </View>
              ) : null}

              <View style={styles.counterPill}>
                <Text style={styles.counterText}>
                  {foundHotspots.length}/{zone.hotspots.length}
                </Text>
              </View>
            </View>
          </View>

          {feedback ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}

          {isEditMode ? (
            <View style={styles.editControls}>
              <Pressable
                onPress={() => {
                  const nextId = createHotspotId(zoneId, editableHotspots);
                  const nextHotspots = [
                    ...editableHotspots,
                    { id: nextId, label: nextId, x: 50, y: 50 },
                  ];

                  void persistHotspots(nextHotspots);
                  setSelectedHotspotId(nextId);
                  showFeedback(`Added ${nextId}: 50.0,50.0`);
                }}
                style={styles.addHotspotButton}
              >
                <Text style={styles.addHotspotText}>+ Add hotspot</Text>
              </Pressable>

              <Pressable
                onPress={() => setDeleteMode((current) => !current)}
                style={[
                  styles.deleteToggleButton,
                  deleteMode && styles.deleteToggleButtonActive,
                ]}
              >
                <Text style={styles.deleteToggleText}>
                  {deleteMode ? "Delete ON" : "Delete"}
                </Text>
              </Pressable>

              <View style={styles.debugBadge}>
                <Text style={styles.debugText}>
                  {`Map ${Math.round(mapBounds.width)}x${Math.round(mapBounds.height)} · ${selectedHotspot ? `${selectedHotspot.id} ${selectedHotspot.x.toFixed(1)},${selectedHotspot.y.toFixed(1)}` : "No hotspot selected"}`}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.bottomCard}>
            <Text style={styles.remainingText}>
              {remaining > 0
                ? `Te faltan ${remaining} estrella${remaining === 1 ? "" : "s"}.`
                : "Todo encontrado. ¡Prepárate para continuar!"}
            </Text>

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
  titleWrap: {
    gap: 2,
  },
  topRightWrap: {
    alignItems: "flex-end",
    gap: 8,
  },
  editBadge: {
    backgroundColor: "rgba(255, 209, 102, 0.22)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBadgeText: {
    color: "#FFD166",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
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
  editControls: {
    bottom: 130,
    gap: 10,
    position: "absolute",
    right: 24,
  },
  addHotspotButton: {
    backgroundColor: "rgba(10,16,36,0.9)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addHotspotText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  deleteToggleButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteToggleButtonActive: {
    backgroundColor: "#EF476F",
  },
  deleteToggleText: {
    color: "#1A1A1A",
    fontSize: 13,
    fontWeight: "800",
  },
  debugBadge: {
    backgroundColor: "rgba(10,16,36,0.72)",
    borderRadius: 14,
    maxWidth: 220,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  debugText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    lineHeight: 15,
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
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});