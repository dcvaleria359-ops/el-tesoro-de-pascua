import AsyncStorage from "@react-native-async-storage/async-storage";

import { Hotspot } from "@/src/huntConfig";

let inMemoryOverrides: Record<string, Hotspot[]> = {};
let storageMode: "unknown" | "async" | "memory" = "unknown";

const getZoneStorageKey = (zoneId: number) => `hunt.hotspots.override.zone${zoneId}`;

const cloneHotspots = (hotspots: Hotspot[]) =>
  hotspots.map((hotspot) => ({ ...hotspot }));

const clampPercent = (value: number) =>
  Number(Math.min(100, Math.max(0, value)).toFixed(1));

const normalizeHotspots = (hotspots: Hotspot[]) =>
  hotspots.map((hotspot) => ({
    ...hotspot,
    label: hotspot.label || hotspot.id,
    x: clampPercent(hotspot.x),
    y: clampPercent(hotspot.y),
  }));

async function canUseAsyncStorage() {
  if (storageMode === "async") {
    return true;
  }

  if (storageMode === "memory") {
    return false;
  }

  try {
    if (
      !AsyncStorage ||
      typeof AsyncStorage.getItem !== "function" ||
      typeof AsyncStorage.setItem !== "function"
    ) {
      storageMode = "memory";
      return false;
    }

    const probeKey = `${getZoneStorageKey(0)}:probe`;
    await AsyncStorage.setItem(probeKey, "1");
    await AsyncStorage.removeItem(probeKey);
    storageMode = "async";
    return true;
  } catch {
    storageMode = "memory";
    return false;
  }
}

async function readZoneOverride(zoneId: number) {
  const storageKey = getZoneStorageKey(zoneId);
  const memoryValue = inMemoryOverrides[storageKey];

  if (!(await canUseAsyncStorage())) {
    return memoryValue;
  }

  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) {
      return memoryValue;
    }

    const normalized = normalizeHotspots(JSON.parse(raw) as Hotspot[]);
    inMemoryOverrides[storageKey] = normalized;
    return normalized;
  } catch {
    storageMode = "memory";
    return memoryValue;
  }
}

export async function getStoredHotspots(zoneId: number, fallbackHotspots: Hotspot[]) {
  const stored = await readZoneOverride(zoneId);

  if (!stored || stored.length === 0) {
    return cloneHotspots(fallbackHotspots);
  }

  const baseById = new Map(fallbackHotspots.map((hotspot) => [hotspot.id, hotspot]));

  return cloneHotspots(
    stored.map((storedHotspot) => {
      const baseHotspot = baseById.get(storedHotspot.id);
      return {
        ...(baseHotspot ?? storedHotspot),
        ...storedHotspot,
      };
    }),
  );
}

export async function saveStoredHotspots(zoneId: number, hotspots: Hotspot[]) {
  const storageKey = getZoneStorageKey(zoneId);
  const nextOverride = normalizeHotspots(hotspots);

  inMemoryOverrides[storageKey] = nextOverride;

  if (!(await canUseAsyncStorage())) {
    return;
  }

  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(nextOverride));
  } catch {
    storageMode = "memory";
  }
}