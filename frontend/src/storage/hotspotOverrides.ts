import AsyncStorage from "@react-native-async-storage/async-storage";

import { Hotspot } from "@/src/huntConfig";

const HOTSPOT_OVERRIDE_KEY = "@easter-hunt-hotspot-overrides";

let inMemoryOverrides: Record<string, Hotspot[]> = {};
let storageMode: "unknown" | "async" | "memory" = "unknown";

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

    const probeKey = `${HOTSPOT_OVERRIDE_KEY}:probe`;
    await AsyncStorage.setItem(probeKey, "1");
    await AsyncStorage.removeItem(probeKey);
    storageMode = "async";
    return true;
  } catch {
    storageMode = "memory";
    return false;
  }
}

async function readAllOverrides() {
  const memoryValue = { ...inMemoryOverrides };

  if (!(await canUseAsyncStorage())) {
    return memoryValue;
  }

  try {
    const raw = await AsyncStorage.getItem(HOTSPOT_OVERRIDE_KEY);
    if (!raw) {
      return memoryValue;
    }

    const parsed = JSON.parse(raw) as Record<string, Hotspot[]>;
    const normalized = Object.fromEntries(
      Object.entries(parsed ?? {}).map(([zoneId, hotspots]) => [
        zoneId,
        normalizeHotspots(hotspots ?? []),
      ]),
    );

    inMemoryOverrides = normalized;
    return normalized;
  } catch {
    storageMode = "memory";
    return memoryValue;
  }
}

export async function getStoredHotspots(zoneId: number, fallbackHotspots: Hotspot[]) {
  const overrides = await readAllOverrides();
  const stored = overrides[String(zoneId)];

  if (!stored || stored.length === 0) {
    return cloneHotspots(fallbackHotspots);
  }

  return cloneHotspots(stored);
}

export async function saveStoredHotspots(zoneId: number, hotspots: Hotspot[]) {
  const overrides = await readAllOverrides();
  const nextOverrides = {
    ...overrides,
    [String(zoneId)]: normalizeHotspots(hotspots),
  };

  inMemoryOverrides = nextOverrides;

  if (!(await canUseAsyncStorage())) {
    return;
  }

  try {
    await AsyncStorage.setItem(
      HOTSPOT_OVERRIDE_KEY,
      JSON.stringify(nextOverrides),
    );
  } catch {
    storageMode = "memory";
  }
}