# Ocean Grid Prototype

An HTML5 Canvas prototype for a procedural ocean-like vector grid.

The current direction is a minimal Tempest-like arcade grid: a perspective-projected wire plane with visual-only audio-reactive water motion across the main grid. This is meant to support early game mechanic exploration, visual background work, interactive art, and technical demo iteration.

## Current Prototype

The active version is a direct-file browser prototype. Open `index.html` directly to run it without installing anything.

Current features:

- Tempest-like perspective ocean grid.
- Finite rows that scroll from the horizon toward the player to imply infinite water.
- Full-main-grid wave and audio-reactive vertex/glow motion.
- Blue decorative side-zone layer clipped away from the central playfield.
- Foreground surfboard vector shape centered on the active lane rail point, with responsive art scaling.
- Lane-rail movement on the front edge of the grid.
- Tap or hold Arrow Left, Arrow Right, A, and D to move between lanes.
- Tap Space when a Jumpwave reaches the player rail cue to trigger a temporary jump-speed state.
- Fast retargetable arcade timing: 38ms lane switches, 45ms hold pulses, ease-out motion, and mid-switch direction correction.
- First-pass obstacle classes draw as projected vector markers on the grid: Seaweed, Tide, and Jumpwave.
- Seaweed and Tide currently act as obstacle-driven speed zones; the older boost/slow terrain patch list is disabled for this obstacle pass.
- Jumpwave grants temporary speed, adds a short surfboard lift/hang/landing bounce, and limits lane movement to four columns from the activation lane while active.
- Jumpwave has a small circular player-rail cue that appears shortly before the timing moment and disappears after a successful Space activation.
- Optional local audio playback drives visual-only grid, terrain, and wave reactivity. The current source order is `test.ogg`, `test.mp3`, `test.m4a`, then `test.wav` on non-Safari desktop, while Safari and mobile use MP3/M4A/WAV fallbacks.
- Audio/FPS debug readout shows playback status, attempted/playing source, bass/treble/volume, FPS, adaptive glow scale, and vector/mobile render mode.
- Performance protection caps Canvas pixel ratio and keeps expensive Canvas shadow/glow effects disabled by default. Mobile stroke-count reduction remains available behind a config flag, but full vector line density is the default.

## Optional Vite Setup

```bash
npm install
```

## Run The Prototype

```bash
npm run dev
```

Vite will print a local URL in the terminal. Open that URL in a browser to view the animated grid.

In this environment, direct `file:///` loading has been the reliable baseline. Vite remains available for later if npm is installed.

## Source Files

- `index.html` creates the page and loads the Canvas app.
- `styles/style.css` makes the Canvas fill the full browser window.
- `src/config.js` owns the main tuning values for the grid, terrain, view, decoration, and player.
- `src/state.js` owns shared runtime state like canvas size, vertices, keys, and player position.
- `src/canvas.js` owns Canvas setup, resizing, and background drawing.
- `src/audio.js` loads and analyzes local test audio after a key/click/touch gesture, then exposes bass, treble, volume, and transient hit values.
- `src/grid.js` creates, projects, and draws the Tempest-like ocean grid.
- `src/wave.js` updates procedural water height and scrolling row depth.
- `src/decor.js` draws the blue procedural side-zone decoration.
- `src/terrain.js` owns boost/slow terrain data and world-speed sampling.
- `src/timing.js` owns the yellow timing target, rail gate, Space hit checks, and timing boost.
- `src/obstacles.js` owns obstacle marker drawing, obstacle speed effects, Jumpwave activation, spacing warnings, and rail cue logic.
- `src/player.js` updates and draws the foreground surfboard marker.
- `src/input.js` listens for Arrow Left, Arrow Right, A, and D.
- `src/main.js` owns only startup and the animation loop.

## Version Snapshots

- `versions/v001-current-working-prototype` preserves the first working one-file runtime.
- `versions/v002-modular-runtime` preserves the first behavior-preserving modular runtime.
- `versions/v003-very-fast-arcade-lane-rail` preserves the current lane-rail control checkpoint.
- `versions/v004-infrastructure-baseline` preserves the current modular baseline before the next speed/infrastructure pass.
- `versions/v005-retarget-easeout-controls` preserves the current approved lane-control feel before expansion.
- `versions/v009-audio-reactive-terrain-baseline` preserves the current audio-reactive terrain baseline before broadening audio response across the full main grid.
- `versions/v010-centered-surfboard-audio-grid-baseline` preserves the current centered-surfboard and full-grid audio response baseline before the next adjustment pass.
- `versions/v011-audio-performance-diagnostic-baseline` preserves the current audio-start and performance diagnostic pass before deeper mobile/iPad fixes.
- `versions/v012-pure-vector-render-safety` preserves the current corrected pure-vector render baseline with OGG-first audio, mobile fallbacks, and shadow/glow/stroke-reduction bottlenecks disabled by default.
- `versions/v013-obstacle-wave-design-baseline` preserves the current baseline before designing classified obstacle size/speed parameters, center-vertex vector markers, color coding, and row/column-specific wave generation.
- `versions/v014-obstacle-interaction-rail-cue` preserves the current obstacle interaction pass with Seaweed/Tide/Jumpwave markers, Jumpwave bounce, four-column cap, spacing warnings, wrap guard, and player-rail cue.

## Main Tuning Points

Edit `src/config.js` first when tuning behavior.

- `TERRAIN.baseWorldSpeed`: baseline forward ocean/world speed.
- `TERRAIN.boostMultiplier`: speed multiplier while the player samples boost terrain.
- `TERRAIN.slowMultiplier`: speed multiplier while the player samples slow terrain.
- `TERRAIN.sampleDepth`: grid-depth line where the board reads terrain for speed.
- `TERRAIN.nearHorizonDepth`: first depth where terrain color is allowed to appear.
- `TERRAIN.foregroundFadeRows`: number of rows before the surfboard rail used to fade terrain out.
- `TERRAIN.patches`: readable abstract terrain definitions. This list is currently empty while the obstacle pass owns the active speed-zone tests.
- `OBSTACLES.classes`: obstacle classification, visual footprint, speed effects, Jumpwave tuning, and rail cue settings.
- `OBSTACLES.placements`: current hand-placed obstacle cells.
- `OBSTACLES.placementRules`: warning-only spacing checks for obstacle anchors.
- Future wave masking should stay data-driven: explicit rows, columns, or cell ranges can opt into stronger constant wave generation while other grid regions remain calmer or flat.
- `TIMING.*`: yellow timing target size, hit window, boost multiplier, cooldown, and respawn pacing.
- `AUDIO.*`: test audio sources, analyzer resolution, smoothing, wave response, shimmer, and glow intensity.
- `PERFORMANCE.*`: pixel-ratio caps, shadow/glow toggles, optional mobile stroke reduction, and FPS/debug readout controls.
- `VIEW.*`: horizon, front edge, grid width, and wave lift.
- `DECOR.*`: blue decorative layer density and motion.
- `PLAYER.laneMoveDuration`: visual time to switch one lane.
- `PLAYER.holdInitialDelay`: delay before held movement starts pulsing.
- `PLAYER.holdPulseInterval`: timing between held lane pulses.
- `PLAYER.laneEase`: lane transition curve. Current value is `easeOut`.
- `PLAYER.allowLaneRetarget`: allows quick opposite-direction correction during a lane shift.
- `PLAYER.showLaneTicks`: shows or hides the front lane anchor dots.

## Obstacle Terrain Prototype

The active mechanic prototype is now obstacle classification layered on top of the terrain-speed idea.

Current rules:

- The old boost/slow terrain patches are disabled so the current screen focuses on Seaweed, Tide, and Jumpwave.
- Seaweed uses a green checkerboard cell footprint and slows forward world speed.
- Tide uses a magenta wave-band marker and increases forward world speed.
- Jumpwave uses a yellow vertical-wave marker, a small circular player-rail cue, Space activation, temporary speed, and a visual surfboard jump.
- Obstacle placements are explicit data objects with type, cell column, and cell row.
- The wave height remains visual-only; terrain speed is tracked separately in `OceanState.world`.
- Scoring, collision, timer, and destination UI are still intentionally deferred.

## Obstacle Interaction Baseline

`v014-obstacle-interaction-rail-cue` is the current checkpoint for the first obstacle interaction pass. The current direction is:

- Keep obstacle data lightweight and readable before adding scoring, failure, destination, or full collision states.
- Keep obstacle visuals separate from terrain/speed effects.
- Attach placeholder vector graphics to projected grid square/cell footprints.
- Use color as a redundant classification signal alongside shape, so obstacle meaning remains readable at speed.
- Guard obstacle footprints against row-wrap stretching from horizon to foreground.
- Use a small player-rail cue for Jumpwave timing instead of the old yellow timing target.
- Keep future horizon-line character/sprite cues separate from the current player-rail cue.

## Audio Reactivity

The project includes a small generated mobile-safe test WAV at:

```text
assets/audio/test.wav
```

Use the same mixed track in several browser formats when testing music reaction:

```text
assets/audio/test.ogg
assets/audio/test.mp3
assets/audio/test.m4a
assets/audio/test.wav
```

The current diagnostic order is OGG, MP3, M4A, then WAV on non-Safari desktop; MP3, M4A, then WAV on mobile; and MP3, M4A, then WAV on Safari. OGG is removed from mobile and Safari-specific source lists because those browsers can report support but still stall without audible playback. The loader filters the active list through browser format support and starts from the first real pointer/touch/click/key gesture. The loader falls through if a source fails, times out, reports `play()` success without playback time advancing, or stalls after playback has started. The current audio pass is visual-only. A single mixed track is analyzed into bass, treble, volume, and short transient hit values. Those values affect full-grid vertex lift, vector line color/width, terrain pulse, and wave shimmer. Terrain generation and yellow target timing are not music-driven yet.

For GitHub Pages/browser testing, the file extension should match the real encoded container. Do not rename an M4A/AAC export to `.mp3`; create a true MP3 file for `test.mp3` and a separate true M4A file for `test.m4a`.

Current audio diagnostic behavior as of April 28, 2026:

- Chrome and Brave desktop testing worked after using the multi-format fallback procedure: keep the music files in `assets/audio`, match filenames to the configured source list, start from the browser-supported source, and verify `audio: playing` plus moving bass/treble/volume meters.
- Desktop keeps OGG-first source priority so the desktop music reaction uses `test.ogg` when available.
- Desktop Safari uses the Safari fallback list, so it starts from `test.mp3` instead of OGG.
- `AUDIO.delayedAutoStart` is disabled because mobile autoplay attempts can leave the audio context locked and burn through the fallback list before a real gesture.
- Mobile source order now uses `test.mp3`, `test.m4a`, then `test.wav`; debug text should show `selected: test.mp3 (mobile)`.
- The script cache-buster is `safari-audio-stall-016`; if a phone or Safari browser still shows `trying: test.ogg`, it is running an older deployed or cached script.
- First pointer, touch, mouse, click, or key gesture calls audio start directly. This gesture-first path is the current reliable baseline.
- The debug readout reports the source queue and active source, for example `source: selected: test.ogg (desktop)`, `source: selected: test.mp3 (mobile)`, or `source: playing: test.m4a`.
- If a browser blocks autoplay, the debug readout should show `gesture needed: ...`; tap/click/press a key to retry from the same selected source.
