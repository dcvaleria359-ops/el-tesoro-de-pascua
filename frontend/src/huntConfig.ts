import { pascua1Image } from "@/src/pascua1Image";

const placeholders = require("./generatedPlaceholderImages.json") as Record<string, string>;

export type MediaSource = number | string | null;
export type ZoneId = 1 | 2 | 3 | 4;

export type Hotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type ZoneConfig = {
  id: ZoneId;
  title: string;
  subtitle: string;
  accentColor: string;
  mapImage: MediaSource;
  mapAspectRatio?: number;
  mapResizeMode?: "cover" | "contain";
  completionVideoUrl: MediaSource;
  nextLabel: string;
  hotspots: Hotspot[];
};

export const startVideoUrl: MediaSource = null;
export const introVideoUrl: MediaSource = require("../assets/videos/intro.mp4");
export const finalVideoUrl: MediaSource = null;
export const startPlaceholderImage: MediaSource = pascua1Image;
export const finalPlaceholderImage: MediaSource = placeholders.final;

export const zones: ZoneConfig[] = [
  {
    id: 1,
    title: "Zona 1",
    subtitle: "Jardín de primavera",
    accentColor: "#EF476F",
    mapImage: require("../assets/maps/zona1.png"),
    mapAspectRatio: 1536 / 2589,
    mapResizeMode: "contain",
    completionVideoUrl: require("../assets/videos/zona1_end.mp4"),
    nextLabel: "IR A LA ZONA 2",
    hotspots: [
      { id: "z1-a", label: "Flor", x: 18.4, y: 24.6 },
      { id: "z1-b", label: "Puerta", x: 72.2, y: 29.8 },
      { id: "z1-c", label: "Sendero", x: 34.6, y: 58.4 },
      { id: "z1-d", label: "Maceta", x: 81.1, y: 75.4 },
    ],
  },
  {
    id: 2,
    title: "Zona 2",
    subtitle: "Rincones secretos",
    accentColor: "#43B0F1",
    mapImage: require("../assets/maps/zona2llamas.jpg"),
    mapAspectRatio: 1080 / 1920,
    mapResizeMode: "contain",
    completionVideoUrl: null,
    nextLabel: "IR A LA ZONA 3",
    hotspots: [
      { id: "z2-a", label: "Llama 1", x: 27.1, y: 54.9 },
      { id: "z2-b", label: "Llama 2", x: 50.0, y: 56.2 },
      { id: "z2-c", label: "Llama 3", x: 96.2, y: 59.0 },
      { id: "z2-d", label: "Llama 4", x: 1.2, y: 69.2 },
      { id: "z2-e", label: "Llama 5", x: 95.5, y: 96.7 },
    ],
  },
  {
    id: 3,
    title: "Zona 3",
    subtitle: "Pistas brillantes",
    accentColor: "#FFD166",
    mapImage: placeholders.zone3,
    mapAspectRatio: 180 / 320,
    completionVideoUrl: null,
    nextLabel: "IR A LA ZONA 4",
    hotspots: [
      { id: "z3-a", label: "Portal", x: 15.9, y: 34.5 },
      { id: "z3-b", label: "Roca", x: 56.1, y: 20.7 },
      { id: "z3-c", label: "Colina", x: 39.7, y: 63.2 },
      { id: "z3-d", label: "Cesta", x: 74.4, y: 82.1 },
    ],
  },
  {
    id: 4,
    title: "Zona 4",
    subtitle: "La gran sorpresa",
    accentColor: "#06D6A0",
    mapImage: placeholders.zone4,
    mapAspectRatio: 180 / 320,
    completionVideoUrl: null,
    nextLabel: "VER FINAL",
    hotspots: [
      { id: "z4-a", label: "Arco", x: 20.6, y: 21.4 },
      { id: "z4-b", label: "Farol", x: 69.3, y: 26.7 },
      { id: "z4-c", label: "Puerta", x: 31.5, y: 68.8 },
      { id: "z4-d", label: "Tesoro", x: 82.9, y: 57.1 },
    ],
  },
];

export const getZoneById = (zoneId: number) =>
  zones.find((zone) => zone.id === zoneId);

export const TOTAL_HOTSPOTS = zones.reduce(
  (count, zone) => count + zone.hotspots.length,
  0,
);