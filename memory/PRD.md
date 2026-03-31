# PRD — Easter Hunt

## Problem Statement
Build an Easter Hunt app with an intro stage, 4 map zones, clickable star hotspots, completion transitions, final celebration, local saved progress, and an edit mode for hotspot placement.

## Architecture
- Frontend: Expo Router + React Native
- Storage: AsyncStorage for local progress persistence
- Backend: Existing FastAPI service retained but unused for this feature set
- Assets: Placeholder base64 images now, local MP4/JPG replacement supported through `frontend/src/huntConfig.ts`

## User Personas
- Parents setting up a quick scavenger hunt for children
- Event organizers who need simple local progress persistence on one device
- Non-technical editors who want quick x/y hotspot capture through edit mode

## Core Requirements
- Intro screen with fullscreen media and start controls
- 4 zones with 4 tappable star hotspots each
- Prevent double counting once a star is found
- Show success feedback after each find
- Completion stage after each zone except the last
- Final celebration after zone 4 with confetti
- Save progress locally
- Edit mode using query param and percentage capture

## Implemented With Dates
- 2026-03-31 — Built Expo mobile adaptation of Easter Hunt flow
- 2026-03-31 — Added AsyncStorage-based progress tracking and reset flow
- 2026-03-31 — Added 4-zone hotspot gameplay, completion routing, and final confetti screen
- 2026-03-31 — Added placeholder media pipeline plus README instructions for swapping in real MP4/JPG files
- 2026-03-31 — Added edit mode to capture x/y map coordinates
- 2026-03-31 — Updated the visible app title to “LOS TESOROS DE PASCUA”
- 2026-03-31 — Replaced the start-screen background with the uploaded `pascua1` image and added a subtle dark gradient overlay
- 2026-03-31 — Upgraded `pascua1` to a sharp full-size welcome background and removed the “Saltar” button
- 2026-03-31 — Added a new IntroVideo step between the welcome screen and Zone 1, ready for `assets/videos/intro.mp4`
- 2026-03-31 — Added the uploaded intro video as a local asset at `assets/videos/intro.mp4` and reveal the CTA only after playback ends
- 2026-03-31 — Enhanced edit mode to copy tapped hotspot coordinates to the clipboard and list existing hotspot coordinates
- 2026-03-31 — Added the uploaded `frontend/assets/maps/zona1.png` as the local Zone 1 map with contain rendering and hotspots on top
- 2026-03-31 — Made progress storage crash-safe with AsyncStorage detection and automatic in-memory fallback
- 2026-03-31 — Added a desktop-accessible Edit link on the Start screen and a native Edit Mode screen to enable editing without manual URL changes
- 2026-03-31 — Added a 2-second long-press zone-title toggle for in-app EDIT ON/OFF with clipboard copying in Expo Go
- 2026-03-31 — Added persistent hotspot override storage so drag-edited placements can survive after leaving EDIT MODE
- 2026-03-31 — Stabilized per-zone hotspot override persistence with rendered-image bounds math for contain-mode maps
- 2026-03-31 — Switched EDIT MODE to explicit draft/save/cancel zone layouts with storage/load source debug info
- 2026-03-31 — Replaced Zone 1 completion placeholder with a real local `zona1_end.mp4` autoplay video and post-video CTA to Zone 2
- 2026-03-31 — Updated Zone 2 to use the uploaded `zona2llamas.jpg` map with five new approximate hotspot defaults for fine-tuning
- 2026-03-31 — Replaced `zona1_end.mp4` with the exact latest uploaded Zone 1 completion video file
- 2026-03-31 — Made Zone 1 completion navigation explicit and added a debug label to confirm the correct completion screen/video
- 2026-03-31 — Removed backend deployment risk by keeping the frontend static-only path and making the template status endpoint cheap and bounded
- 2026-03-31 — Replaced Zone 1 completion asset with the distinct uploaded file `busqueda del tesoro 2 .mp4`

## Prioritized Backlog

### P0
- Replace placeholder intro/completion/final videos with real MP4 assets
- Replace placeholder zone maps with final JPG images

### P1
- Add copy-to-clipboard button for edit mode coordinates
- Add sound effects for star discovery and final celebration
- Add zone-specific hint text or breadcrumb clues

### P2
- Add analytics for completion rate per zone
- Add multilingual text toggle
- Add richer final score summary or timed mode

## Next Tasks List
- Verify the Expo preview flow end-to-end on mobile viewport
- Tune final hotspot coordinates once real maps are added
- Swap the placeholder media values in `frontend/src/huntConfig.ts`