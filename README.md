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
- Tap Space when the yellow timing cell reaches the yellow rail gate while the surfer is in the same lane.
- Fast retargetable arcade timing: 38ms lane switches, 45ms hold pulses, ease-out motion, and mid-switch direction correction.
- Readable boost and slow terrain zones color the main grid and change forward ocean/world speed.
- Yellow timing targets grant a short high-speed boost when lane alignment and Space timing are correct.
- Optional local audio playback drives visual-only grid, terrain, and wave reactivity. The current source order is `test.ogg`, `test.mp3`, `test.m4a`, then `test.wav`, so desktop keeps the real music track while mobile can fall through to MP3/M4A/WAV.
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

## Main Tuning Points

Edit `src/config.js` first when tuning behavior.

- `TERRAIN.baseWorldSpeed`: baseline forward ocean/world speed.
- `TERRAIN.boostMultiplier`: speed multiplier while the player samples boost terrain.
- `TERRAIN.slowMultiplier`: speed multiplier while the player samples slow terrain.
- `TERRAIN.sampleDepth`: grid-depth line where the board reads terrain for speed.
- `TERRAIN.nearHorizonDepth`: first depth where terrain color is allowed to appear.
- `TERRAIN.foregroundFadeRows`: number of rows before the surfboard rail used to fade terrain out.
- `TERRAIN.patches`: readable abstract terrain definitions.
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

## Terrain Prototype

The active mechanic prototype is terrain classification for forward world speed.

Current rules:

- Boost terrain colors the grid bright cyan/green and increases forward ocean/world speed.
- Slow terrain colors the grid purple/blue and reduces forward ocean/world speed.
- Yellow timing cells require lane alignment plus Space timing at the rail gate for a stronger temporary boost.
- Terrain patches are explicit data objects with type, lane center, lane radius, track start, length, and seed.
- The wave height remains visual-only; terrain speed is tracked separately in `OceanState.world`.
- Scoring, collision, timer, and destination UI are still intentionally deferred.

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

The current diagnostic order is MP3, M4A, OGG, then WAV on desktop, and MP3, M4A, then WAV on mobile. OGG is temporarily removed from the mobile list because iPad/Safari and Android can report support but still stall without audible playback. The loader filters the active list through browser format support, gives the selected source a short preload delay, then attempts a delayed auto-start. If the browser blocks that autoplay attempt, the first real pointer/touch/click/key gesture remains the fallback. The loader falls through if a source fails, times out, or reports `play()` success without playback time advancing. The current audio pass is visual-only. A single mixed track is analyzed into bass, treble, volume, and short transient hit values. Those values affect full-grid vertex lift, vector line color/width, terrain pulse, and wave shimmer. Terrain generation and yellow target timing are not music-driven yet.

For GitHub Pages/browser testing, the file extension should match the real encoded container. Do not rename an M4A/AAC export to `.mp3`; create a true MP3 file for `test.mp3` and a separate true M4A file for `test.m4a`.

Current mobile audio diagnostic behavior as of April 25, 2026:

- Chrome and Brave desktop testing worked after using the multi-format fallback procedure: keep the music files in `assets/audio`, match filenames to the configured source list, start from the browser-supported source, and verify `audio: playing` plus moving bass/treble/volume meters.
- `AUDIO.delayedAutoStart` is temporarily enabled so the prototype waits briefly, then tries to start music on its own for quick browser/mobile visual tests.
- Mobile source order now uses `test.mp3`, `test.m4a`, then `test.wav`; debug text should show `selected: test.mp3 (mobile)`.
- The script cache-buster is `mobile-audio-fallback-014`; if a phone still shows `trying: test.ogg`, it is running an older deployed or cached script.
- First pointer, touch, mouse, click, or key gesture calls audio start directly.
- The debug readout reports the source queue and active source, for example `source: selected: test.ogg (4 sources)`, `source: trying: test.mp3`, or `source: playing: test.m4a`.
- If a browser blocks autoplay, the debug readout should show `gesture needed: ...`; tap/click/press a key to retry from the same selected source.
