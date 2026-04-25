# Ocean Grid Prototype

An HTML5 Canvas prototype for a procedural ocean-like vector grid.

The current direction is a minimal Tempest-like arcade grid: a perspective-projected wire plane with an infinite procedural wave ridge rising on the left side. This is meant to support early game mechanic exploration, visual background work, interactive art, and technical demo iteration.

## Current Prototype

The active version is a direct-file browser prototype. Open `index.html` directly to run it without installing anything.

Current features:

- Tempest-like perspective ocean grid.
- Finite rows that scroll from the horizon toward the player to imply infinite water.
- Left-side raised wave geometry.
- Blue decorative side-zone layer clipped away from the central playfield.
- Foreground surfboard vector shape.
- Lane-rail movement on the front edge of the grid.
- Tap or hold Arrow Left, Arrow Right, A, and D to move between lanes.
- Tap Space when the yellow timing cell reaches the yellow rail gate while the surfer is in the same lane.
- Fast retargetable arcade timing: 38ms lane switches, 45ms hold pulses, ease-out motion, and mid-switch direction correction.
- Readable boost and slow terrain zones color the main grid and change forward ocean/world speed.
- Yellow timing targets grant a short high-speed boost when lane alignment and Space timing are correct.
- Optional `assets/audio/test.ogg` playback drives visual-only grid, terrain, and wave reactivity. `test.wav` is a local fallback.

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
- `src/audio.js` loads and analyzes `assets/audio/test.ogg` after the first key press, with `test.wav` as a local fallback.
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

Place the test track at:

```text
assets/audio/test.ogg
```

The current audio pass is visual-only. A single mixed track is analyzed into bass, treble, and volume values. Bass increases the left wave ridge and boost-terrain pulse, treble adds small vertex shimmer and slow-terrain pulse, and volume brightens the white wave/glow threshold. Terrain generation and yellow target timing are not music-driven yet.
