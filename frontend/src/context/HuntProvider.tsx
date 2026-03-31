import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getZoneById, zones } from "@/src/huntConfig";
import {
  defaultProgress,
  HuntProgress,
  readProgress,
  saveProgress,
} from "@/src/storage/huntProgress";

type MarkResult = {
  added: boolean;
  remaining: number;
  completed: boolean;
};

type HuntContextValue = {
  progress: HuntProgress;
  isLoading: boolean;
  isEditModeEnabled: boolean;
  enableEditMode: () => void;
  toggleEditMode: () => void;
  getFoundHotspots: (zoneId: number) => string[];
  getFirstPlayableZone: () => number;
  isZoneUnlocked: (zoneId: number) => boolean;
  markHotspot: (
    zoneId: number,
    hotspotId: string,
    totalHotspots?: number,
    activeHotspotIds?: string[],
  ) => Promise<MarkResult>;
  resetProgress: () => Promise<void>;
  startHunt: () => Promise<void>;
};

const HuntContext = createContext<HuntContextValue | undefined>(undefined);

export function HuntProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<HuntProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModeEnabled, setIsEditModeEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    readProgress().then((saved) => {
      if (isMounted) {
        setProgress(saved);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const persist = async (nextProgress: HuntProgress) => {
    setProgress(nextProgress);
    await saveProgress(nextProgress);
  };

  const getFoundHotspots = (zoneId: number) =>
    progress.foundHotspots[String(zoneId)] ?? [];

  const isZoneUnlocked = (zoneId: number) =>
    zoneId === 1 ||
    progress.completedZones.includes(zoneId) ||
    progress.completedZones.includes(zoneId - 1);

  const getFirstPlayableZone = () =>
    zones.find((zone) => !progress.completedZones.includes(zone.id))?.id ?? 4;

  const enableEditMode = () => {
    setIsEditModeEnabled(true);
  };

  const toggleEditMode = () => {
    setIsEditModeEnabled((current) => !current);
  };

  const startHunt = async () => {
    if (progress.startedAt) {
      return;
    }

    await persist({
      ...progress,
      startedAt: new Date().toISOString(),
    });
  };

  const markHotspot = async (
    zoneId: number,
    hotspotId: string,
    totalHotspots?: number,
    activeHotspotIds?: string[],
  ) => {
    const zone = getZoneById(zoneId);
    if (!zone) {
      return { added: false, remaining: 0, completed: false };
    }

    const hotspotCount = totalHotspots ?? zone.hotspots.length;

    const existing = activeHotspotIds?.length
      ? getFoundHotspots(zoneId).filter((id) => activeHotspotIds.includes(id))
      : getFoundHotspots(zoneId);
    if (existing.includes(hotspotId)) {
      return {
        added: false,
        remaining: Math.max(hotspotCount - existing.length, 0),
        completed: progress.completedZones.includes(zoneId),
      };
    }

    const nextFound = [...existing, hotspotId];
    const completed = nextFound.length === hotspotCount;
    const completedZones = completed
      ? Array.from(new Set([...progress.completedZones, zoneId])).sort()
      : progress.completedZones;

    const nextProgress: HuntProgress = {
      ...progress,
      startedAt: progress.startedAt ?? new Date().toISOString(),
      foundHotspots: {
        ...progress.foundHotspots,
        [String(zoneId)]: nextFound,
      },
      completedZones,
      finishedAt:
        completed && zoneId === 4
          ? new Date().toISOString()
          : progress.finishedAt,
    };

    await persist(nextProgress);

    return {
      added: true,
      remaining: Math.max(hotspotCount - nextFound.length, 0),
      completed,
    };
  };

  const resetProgress = async () => {
    await persist(defaultProgress);
  };

  const value = useMemo(
    () => ({
      progress,
      isLoading,
      isEditModeEnabled,
      enableEditMode,
      toggleEditMode,
      getFoundHotspots,
      getFirstPlayableZone,
      isZoneUnlocked,
      markHotspot,
      resetProgress,
      startHunt,
    }),
    [isEditModeEnabled, isLoading, progress],
  );

  return <HuntContext.Provider value={value}>{children}</HuntContext.Provider>;
}

export function useHunt() {
  const context = useContext(HuntContext);

  if (!context) {
    throw new Error("useHunt must be used inside HuntProvider");
  }

  return context;
}