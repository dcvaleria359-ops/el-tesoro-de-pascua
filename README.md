# Easter Hunt

Expo mobile adaptation of the requested Easter Hunt experience.

## What’s included

- Welcome screen with `pascua1` background and **¡EMPEZAR!** button
- Separate IntroVideo screen before Zone 1
- 4 zone flow with fullscreen map placeholders and 4 star hotspots per zone
- Local progress saved with **AsyncStorage**
- Zone completion stage after zones 1–3
- Final celebration screen with confetti after zone 4
- `?edit=1` support to capture hotspot coordinates in percentages

## Main files

- `frontend/src/huntConfig.ts` — zones, hotspots, placeholder assets, and video slots
- `frontend/app/index.tsx` — intro/start screen
- `frontend/app/intro-video.tsx` — fullscreen intro video screen before Zone 1
- `frontend/app/zone/[zoneId].tsx` — hotspot gameplay and edit mode
- `frontend/app/zone/[zoneId]/complete.tsx` — completion stage for zones 1–3
- `frontend/app/final.tsx` — final celebration

## How to replace the JPG/MP4 placeholders

This build currently uses **placeholder screens** because some media files were missing.

### 1. Add your files

Create these folders if you want a clean media structure:

- `frontend/assets/media/maps/`
- `frontend/assets/media/videos/`

Suggested filenames:

- `frontend/assets/videos/intro.mp4`
- `frontend/assets/media/videos/zone1_end.mp4`
- `frontend/assets/media/videos/zone2_end.mp4`
- `frontend/assets/media/videos/zone3_end.mp4`
- `frontend/assets/media/videos/final.mp4`
- `frontend/assets/media/maps/zone1.jpg`
- `frontend/assets/media/maps/zone2.jpg`
- `frontend/assets/media/maps/zone3.jpg`
- `frontend/assets/media/maps/zone4.jpg`

### 2. Update `frontend/src/huntConfig.ts`

Replace the placeholder values with literal `require(...)` calls.

Example:

```ts
export const introVideoUrl = require("../assets/videos/intro.mp4");
export const finalVideoUrl = require("../assets/media/videos/final.mp4");

mapImage: require("../assets/media/maps/zone1.jpg"),
completionVideoUrl: require("../assets/media/videos/zone1_end.mp4"),
```

### Intro Kling video note

Replace `frontend/assets/videos/intro.mp4` with your final Kling video, keeping the **same filename** so the IntroVideo screen continues to work without extra code changes.

The IntroVideo screen now loads the file locally through `require("../assets/videos/intro.mp4")` from `frontend/src/huntConfig.ts`.

### 3. Adjust hotspot coordinates

Each hotspot uses percentage coordinates:

```ts
{ id: "z1-a", label: "Flor", x: 18.4, y: 24.6 }
```

- `x` = horizontal position in %
- `y` = vertical position in %

## Edit mode

Open a zone with `?edit=1`.

Examples:

- `/zone/1?edit=1`
- `/zone/2?edit=1`

In edit mode:

- tap anywhere on the map
- the app shows `x` / `y` percentages
- a temporary preview hotspot appears
- copy those values into `frontend/src/huntConfig.ts`

## Progress storage

- No auth
- No database
- Progress is stored locally on the device with AsyncStorage

To clear progress from the UI, use **Reiniciar progreso** or **Reiniciar**.
