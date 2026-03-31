import AsyncStorage from "@react-native-async-storage/async-storage";

export const HUNT_PROGRESS_KEY = "@easter-hunt-progress";

export type HuntProgress = {
  foundHotspots: Record<string, string[]>;
  completedZones: number[];
  startedAt: string | null;
  finishedAt: string | null;
};

export const defaultProgress: HuntProgress = {
  foundHotspots: {},
  completedZones: [],
  startedAt: null,
  finishedAt: null,
};

let inMemoryProgress: HuntProgress = { ...defaultProgress };
let storageMode: "unknown" | "async" | "memory" = "unknown";

const cloneProgress = (progress: HuntProgress): HuntProgress => ({
  ...progress,
  completedZones: [...progress.completedZones],
  foundHotspots: Object.fromEntries(
    Object.entries(progress.foundHotspots).map(([zoneId, hotspots]) => [
      zoneId,
      [...hotspots],
    ]),
  ),
});

const normalizeProgress = (progress?: Partial<HuntProgress>): HuntProgress => ({
  ...defaultProgress,
  ...progress,
  completedZones: Array.isArray(progress?.completedZones)
    ? [...progress.completedZones]
    : [],
  foundHotspots: progress?.foundHotspots ?? {},
});

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

    const probeKey = `${HUNT_PROGRESS_KEY}:probe`;
    await AsyncStorage.setItem(probeKey, "1");
    await AsyncStorage.removeItem(probeKey);
    storageMode = "async";
    return true;
  } catch {
    storageMode = "memory";
    return false;
  }
}

export async function readProgress(): Promise<HuntProgress> {
  const memoryValue = cloneProgress(inMemoryProgress);

  if (!(await canUseAsyncStorage())) {
    return memoryValue;
  }

  try {
    const raw = await AsyncStorage.getItem(HUNT_PROGRESS_KEY);
    if (!raw) {
      return memoryValue;
    }

    const parsed = normalizeProgress(JSON.parse(raw) as Partial<HuntProgress>);
    inMemoryProgress = cloneProgress(parsed);

    return parsed;
  } catch {
    storageMode = "memory";
    return memoryValue;
  }
}

export async function saveProgress(progress: HuntProgress) {
  const safeProgress = normalizeProgress(progress);
  inMemoryProgress = cloneProgress(safeProgress);

  if (!(await canUseAsyncStorage())) {
    return;
  }

  try {
    await AsyncStorage.setItem(HUNT_PROGRESS_KEY, JSON.stringify(safeProgress));
  } catch {
    storageMode = "memory";
  }
}