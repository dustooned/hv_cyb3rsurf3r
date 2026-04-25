# Ocean Grid Prototype Handoff

## Current Status

The active root project is a working modular HTML5 Canvas arcade prototype. It is designed to run directly from:

```text
file:///E:/OneDrive/Documents/New%20project/ocean-grid-prototype/index.html
```

Current checkout path in this session:

```text
E:\2026\Dev\Experiment\Hurricane Vendetta Demos\Cyber Surfer\ocean-grid-prototype
```

No npm install is required for the current browser path.

## What We Built

- A Tempest-like ocean grid rendered with Canvas vector lines.
- A finite set of grid rows that scroll from the horizon toward the player, creating an infinite procedural water illusion.
- Full-main-grid wave and audio-reactive vertex/glow motion. The old left-side wave mask has been removed from the active root.
- A brighter blue decorative side-zone layer clipped outside the central playfield.
- A foreground surfboard-like vector player marker centered on the active lane rail point.
- Lane-rail movement along the closest/front edge of the grid.
- Hold-pulse controls so the board can move rhythmically across lanes while a key is held.
- Ease-out lane movement and mid-switch retargeting so quick direction reversals feel less like recoil.
- Boost and slow terrain zones rendered as colored main-grid lines in the lofi active version.
- Terrain sampling that changes forward ocean/world speed without adding scoring, collision, timer, or destination logic.
- Yellow timing targets that grant a short high-speed boost when the surfer is lane-aligned and Space is pressed at the rail gate.
- Optional `assets/audio/test.ogg` analysis that drives visual-only wave height, terrain pulse, shimmer, and grid glow. `test.wav` remains a local fallback, but iPad/mobile browsers likely need MP3/M4A/AAC.
- Audio/FPS debug readout showing playback status, bass/treble/volume, FPS, and adaptive glow scale.
- Performance safeguards that cap Canvas pixel ratio and reduce glow/decor cost when slower browsers struggle.

## Active Controls

- `ArrowLeft` or `A`: move left one lane, or pulse left while held.
- `ArrowRight` or `D`: move right one lane, or pulse right while held.
- `Space`: trigger the yellow timing gate if the surfer is aligned with the yellow target lane.

Current arcade timing in `src/config.js`:

```js
laneMoveDuration: 38,
holdInitialDelay: 70,
holdPulseInterval: 45,
laneEase: "easeOut",
allowLaneRetarget: true,
```

## Architecture

The root `src/` folder is now the active source of truth:

- `config.js`: tuning values.
- `state.js`: runtime state.
- `canvas.js`: Canvas setup, resize, and background.
- `audio.js`: optional OGG-first test-track loading, Web Audio frequency analysis, and normalized bass/treble/volume values.
- `grid.js`: grid creation, projection, and drawing.
- `wave.js`: procedural row depth and wave height.
- `decor.js`: blue decorative side-zone rendering.
- `terrain.js`: terrain patch data, terrain queries, and speed sampling.
- `timing.js`: yellow rail-gate timing target, Space hit checks, boost/cooldown state, and timing visuals.
- `player.js`: surfboard lane movement and drawing.
- `input.js`: keyboard state and movement requests.
- `main.js`: startup and animation loop only.

The project intentionally uses ordered classic scripts in `index.html` instead of ES modules so direct `file:///` loading stays reliable.

## Version Snapshots

- `v001-current-working-prototype`: first working one-file runtime.
- `v002-modular-runtime`: behavior-preserving modular split.
- `v003-very-fast-arcade-lane-rail`: current saved checkpoint with very-fast hold-pulse lane controls.
- `v004-infrastructure-baseline`: modular baseline before the current retarget/ease-out control pass.
- `v005-retarget-easeout-controls`: current approved checkpoint before expansion.
- `v006-terrain-speed-prototype`: terrain classification and world-speed prototype.
- `v007-foreground-fade-baseline`: pre-lofi terrain-shape version with horizon clipping, foreground fade, and mobile canvas cleanup.
- `v008-lofi-grid-terrain`: active lofi version with reduced grid/decor density and terrain shown through colored grid lines.
- `v009-audio-reactive-terrain-baseline`: current checkpoint with yellow timing rail, OGG-first audio analysis, terrain pulse, wave shimmer, and white grid glow reactivity.
- `v010-centered-surfboard-audio-grid-baseline`: current checkpoint with full-grid audio visual response, reduced automatic wave amplitude, and a surfboard centered on the projected rail dot.
- `v011-audio-performance-diagnostic-baseline`: current checkpoint with responsive board scaling, audio-start diagnostics, FPS/glow readout, and mobile/iPad issue notes before deeper compatibility work.

## Lessons Learned

- Start with a working one-file prototype when browser loading is uncertain.
- Once behavior works, refactor into modules without changing visuals.
- Keep direct tuning in `src/config.js`; do not bury magic numbers inside rendering code.
- Cache-busting query strings on scripts help direct-file browser reloads pick up changes.
- Lane-based control fits this Tempest/ocean-grid direction better than free pixel movement.
- Visual anchor dots on the front rail help debug lane feel and player position.
- Committed lane switches can feel like recoil when reversing direction; retargeting from the current visual lane feels better.
- `easeOut` makes lane correction feel faster and less sticky than the earlier ease-in-out switch.
- OGG-first audio works in desktop Chromium-style testing, but iPad/mobile Safari-family browsers likely need MP3/M4A/AAC.
- If FPS is slow after glow scale bottoms out, the bottleneck is probably total stroke/path count rather than only `shadowBlur`.

## Recommended Next Steps

1. Continue testing whether `38ms` ease-out movement is fast enough after longer play.
2. Decide whether lane dots are permanent UI, debug-only, or stylized game markers.
3. Playtest whether lofi terrain-colored grid lines are readable at speed.
4. Use terrain to affect forward ocean/world speed, not lane-change speed.
5. Keep two readable terrain types before adding hazards or scoring:
   - Boost terrain: bright cyan/green grid lines, increases world speed.
   - Slow terrain: purple/blue grid lines, reduces world speed.
6. Keep terrain readable through the grid line language before adding new visual systems.
7. Add a mobile-safe audio source such as `assets/audio/test.mp3` or `assets/audio/test.m4a` and make the debug readout show which source actually loaded.
8. Add a mobile performance mode that reduces visual stroke count, not just glow blur.
9. Save another version snapshot before adding collision, timer, scoring, or destination logic.

## Current Terrain Prototype

Terrain is intentionally separate from wave height:

- `src/config.js` has lofi `GRID`/`DECOR` density values plus `TERRAIN` tuning for base speed, boost/slow multipliers, sample depth, and patch definitions.
- `OceanState.world.progress` is the single forward-scroll value consumed by `src/wave.js`.
- `src/terrain.js` samples the player's current lane against visible terrain at `TERRAIN.sampleDepth`.
- `src/grid.js` queries terrain while drawing each grid line and colors boost/slow zones directly on the main grid.
- `src/timing.js` draws the yellow target cell and rail gate, then overrides world speed during successful timing boosts.
- `src/audio.js` analyzes one mixed track from local audio sources; current audio values affect visuals only, not terrain generation or timing spawns.
- No scoring, collision, timer, destination, or failure states have been added.

## Current Diagnostic Notes

Journal entry, April 25, 2026:

- Broadened audio reactivity from the old left-side wave mask to the whole main grid.
- Removed the left-only wave mask after it created residual high vertices on one side.
- Reduced mechanical always-on wave motion and added transient bass/treble/volume hit values.
- Centered the surfboard on the active lane dot and rotated it toward the projected grid lane direction.
- Added responsive surfboard art scaling so gameplay anchors remain grid-relative while art dimensions adapt to desktop, tablet, and phone sizes.
- Added audio debug readout and then FPS/glow diagnostics.
- Added pointer/mouse/click/touch gesture listeners for audio start.
- Added performance controls: Canvas pixel ratio cap, adaptive glow scale, and lower-detail decorative paths when performance drops.
- Verified in the in-app Chromium browser that key/click can start audio and show moving meters, but user still reports Chrome/Brave and iPad/mobile startup trouble.
- Current hypothesis: iPad/mobile browsers cannot use `test.ogg`; they need MP3/M4A/AAC and a direct first-gesture audio unlock path. Slow iPad FPS likely comes from total Canvas stroke/path count after glow is already reduced.

## Next Chat Starter

Use this when starting the next portion:

```text
We are continuing the Ocean Grid Prototype in E:\2026\Dev\Experiment\Hurricane Vendetta Demos\Cyber Surfer\ocean-grid-prototype.

Please read README.md, HANDOFF.md, and EVALUATION.md first. The current app runs directly from index.html with ordered classic scripts. Do not switch to npm/Vite unless explicitly needed.

Current direction: lofi Tempest-like vector ocean, lane-rail surfboard controls, front anchor dots, ease-out retarget movement, centered responsive surfboard art, full-grid audio-reactive visuals, and readable boost/slow terrain shown as colored grid lines that modulate forward world speed.

Current checkpoint: v011-audio-performance-diagnostic-baseline.

Next task: fix mobile/iPad audio and FPS issues. Start by adding a mobile-safe audio source such as `assets/audio/test.mp3` or `assets/audio/test.m4a`, improving source-specific debug status, and making the first touch/click audio unlock as direct as possible. Then add a mobile performance mode that reduces Canvas stroke/path count, not just glow blur. Do not change terrain generation, yellow target timing, scoring, collision, timer, or destination logic yet.
```
