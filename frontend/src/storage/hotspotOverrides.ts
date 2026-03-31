import AsyncStorage from "@react-native-async-storage/async-storage";

import { Hotspot } from "@/src/huntConfig";

let inMemoryOverrides: Record<string, Hotspot[]> = {};
let storageMode: "unknown" | "async" | "memory" = "unknown";

const ZONE_LAYOUT_STORAGE_VERSION: Record<number, number> = {
  3: 2,
};

const getZoneStorageKey = (zoneId: number) => {
  const version = ZONE_LAYOUT_STORAGE_VERSION[zoneId];
  return version
    ? `hunt.zoneLayout.${zoneId}.v${version}`
    : `hunt.zoneLayout.${zoneId}`;
};

export type ZoneLayoutLoadResult = {
  hotspots: Hotspot[];
  layoutSource: "Saved" | "Default";
  storage: "AsyncStorage" | "Memory";
};

export type ZoneLayoutSaveResult = {
  ok: boolean;
  storage: "AsyncStorage" | "Memory";
};

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

const getStorageLabel = (): "AsyncStorage" | "Memory" =>
  storageMode === "async" ? "AsyncStorage" : "Memory";

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

export async function loadZoneLayout(
  zoneId: number,
  fallbackHotspots: Hotspot[],
): Promise<ZoneLayoutLoadResult> {
  const stored = await readZoneOverride(zoneId);

  if (!stored || stored.length === 0) {
    return {
      hotspots: cloneHotspots(fallbackHotspots),
      layoutSource: "Default",
      storage: getStorageLabel(),
    };
  }

  return {
    hotspots: cloneHotspots(stored),
    layoutSource: "Saved",
    storage: getStorageLabel(),
  };
}

export async function saveStoredHotspots(
  zoneId: number,
  hotspots: Hotspot[],
): Promise<ZoneLayoutSaveResult> {
  const storageKey = getZoneStorageKey(zoneId);
  const nextOverride = normalizeHotspots(hotspots);

  inMemoryOverrides[storageKey] = nextOverride;

  if (!(await canUseAsyncStorage())) {
    return { ok: true, storage: getStorageLabel() };
  }

  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(nextOverride));
    return { ok: true, storage: getStorageLabel() };
  } catch {
    storageMode = "memory";
    return { ok: true, storage: getStorageLabel() };
  }
}

export async function resetZoneLayout(
  zoneId: number,
): Promise<ZoneLayoutSaveResult> {
  const storageKey = getZoneStorageKey(zoneId);
  delete inMemoryOverrides[storageKey];

  if (!(await canUseAsyncStorage())) {
    return { ok: true, storage: getStorageLabel() };
  }

  try {
    await AsyncStorage.removeItem(storageKey);
    return { ok: true, storage: getStorageLabel() };
  } catch {
    storageMode = "memory";
    return { ok: true, storage: getStorageLabel() };
  }
}