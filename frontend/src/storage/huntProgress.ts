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

export async function readProgress(): Promise<HuntProgress> {
  try {
    const raw = await AsyncStorage.getItem(HUNT_PROGRESS_KEY);
    if (!raw) {
      return defaultProgress;
    }

    const parsed = JSON.parse(raw) as Partial<HuntProgress>;

    return {
      ...defaultProgress,
      ...parsed,
      foundHotspots: parsed.foundHotspots ?? {},
      completedZones: parsed.completedZones ?? [],
    };
  } catch {
    return defaultProgress;
  }
}

export async function saveProgress(progress: HuntProgress) {
  await AsyncStorage.setItem(HUNT_PROGRESS_KEY, JSON.stringify(progress));
}