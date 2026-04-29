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
- Optional local audio analysis that drives visual-only wave height, terrain pulse, shimmer, and vector line response. Non-Safari desktop keeps `assets/audio/test.ogg` first, while Safari and mobile use MP3/M4A/WAV fallback lists.
- Audio/FPS debug readout showing playback status, source status, bass/treble/volume, FPS, adaptive glow scale, and vector/mobile render mode.
- Performance safeguards that cap Canvas pixel ratio and keep expensive Canvas shadows/glow disabled by default. Mobile stroke-count reduction is still available behind a config flag, but full vector line density is the default.

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
- `audio.js`: direct first-gesture test-track loading, source-specific debug status, Web Audio frequency analysis, and normalized bass/treble/volume values.
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
- `v012-pure-vector-render-safety`: current corrected checkpoint with OGG-first audio restored, mobile fallbacks retained, and Canvas shadows/glow/stroke-reduction bottlenecks disabled by default.
- `v013-obstacle-wave-design-baseline`: current planning checkpoint before adding classified obstacle size/speed parameters, center-vertex vector markers, color coding, and selective row/column wave generation.

## Lessons Learned

- Start with a working one-file prototype when browser loading is uncertain.
- Once behavior works, refactor into modules without changing visuals.
- Keep direct tuning in `src/config.js`; do not bury magic numbers inside rendering code.
- Cache-busting query strings on scripts help direct-file browser reloads pick up changes.
- Lane-based control fits this Tempest/ocean-grid direction better than free pixel movement.
- Visual anchor dots on the front rail help debug lane feel and player position.
- Committed lane switches can feel like recoil when reversing direction; retargeting from the current visual lane feels better.
- `easeOut` makes lane correction feel faster and less sticky than the earlier ease-in-out switch.
- OGG-first audio keeps the non-Safari desktop music reaction, while MP3/M4A/WAV remain fallback options for Safari and mobile browsers.
- The current pure-vector safety pass keeps Canvas shadows/glow disabled by default and does not skip grid/decor lines unless `PERFORMANCE.enableMobileStrokeReduction` is manually enabled.

## Recommended Next Steps

1. Continue testing whether `38ms` ease-out movement is fast enough after longer play.
2. Decide whether lane dots are permanent UI, debug-only, or stylized game markers.
3. Playtest whether lofi terrain-colored grid lines are readable at speed.
4. Use terrain to affect forward ocean/world speed, not lane-change speed.
5. Keep two readable terrain types before adding hazards or scoring:
   - Boost terrain: bright cyan/green grid lines, increases world speed.
   - Slow terrain: purple/blue grid lines, reduces world speed.
6. Keep terrain readable through the grid line language before adding new visual systems.
7. Test `v012-pure-vector-render-safety` on desktop and iPad/mobile before re-enabling any shadows, glow, or stroke-count reduction.
8. If FPS is still low in pure-vector mode, tune geometry/path complexity carefully without skipping visible grid lines by default.
9. Start the obstacle pass with data-only definitions before adding collision, timer, scoring, or destination logic.
10. Define obstacle classes by size, speed effect, color, and center-cell vector marker.
11. Define row/column wave masks so constant waves can exist in specific grid regions and stay absent elsewhere.

## Current Terrain Prototype

Terrain is intentionally separate from wave height:

- `src/config.js` has lofi `GRID`/`DECOR` density values plus `TERRAIN` tuning for base speed, boost/slow multipliers, sample depth, and patch definitions.
- `OceanState.world.progress` is the single forward-scroll value consumed by `src/wave.js`.
- `src/terrain.js` samples the player's current lane against visible terrain at `TERRAIN.sampleDepth`.
- `src/grid.js` queries terrain while drawing each grid line and colors boost/slow zones directly on the main grid.
- `src/timing.js` draws the yellow target cell and rail gate, then overrides world speed during successful timing boosts.
- `src/audio.js` analyzes one mixed track from local audio sources; current audio values affect visuals only, not terrain generation or timing spawns.
- No scoring, collision, timer, destination, or failure states have been added.

## Obstacle And Wave Design Baseline

This checkpoint is for planning the next lightweight grid-system layer:

- Obstacle definitions should live as data first, likely near or beside terrain data, with explicit `type`, lane/column range, row/depth range, speed effect, color, and marker shape fields.
- Center-vertex or center-cell markers should be projected from grid geometry, so placeholder vector graphics stay attached to the grid instead of floating in screen space.
- Color coding should reinforce obstacle classification but should not be the only readable signal.
- Constant wave generation should become a mask or rule set by row/column/cell range, allowing active wave bands in some areas and calm grid regions in others.
- Keep collision, scoring, destination, and timer systems deferred until obstacle placement and readability are proven.

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
- Current rendering fix: checked-in `test.wav` remains as a mobile fallback, but `test.ogg` is preferred again for desktop music reaction. Canvas shadows/glow and automatic stroke-count reduction are disabled by default to keep the picture purely vectorized and stable.
- Current audio fallback fix: keep one mixed track exported as `test.ogg`, `test.mp3`, `test.m4a`, and `test.wav`. The loader keeps OGG first on desktop, uses MP3/M4A/WAV on mobile, filters playable formats, starts from the first user gesture, and falls through on source failure or a short startup timeout.
- End-of-day audio test note: Chrome and Brave desktop playback worked with the multi-format fallback procedure and the debug meters moving. `AUDIO.delayedAutoStart` was tested and then disabled because autoplay attempts caused browsers to burn through fallback sources before a reliable gesture unlock.
- Mobile follow-up: iPad Safari and Android can report OGG support while still not producing audible playback. The active loader now uses a mobile-specific order of MP3, M4A, WAV only and reports `playing` only after playback time advances.
- Cache/resume follow-up: bumped `index.html` script query strings to `mobile-audio-fallback-014`, broadened mobile detection to coarse-pointer small screens, and added an `AudioContext.resume()` timeout so mobile cannot stay stuck at `audio: starting` forever.
- Final working baseline for now: `AUDIO.delayedAutoStart` is `false`, script cache key is `mobile-audio-fallback-015`, desktop source order is OGG/MP3/M4A/WAV, mobile source order is MP3/M4A/WAV, and audio starts from a real tap/click/key gesture.
- Safari desktop follow-up, April 28, 2026: added a Safari-specific MP3/M4A/WAV source list, a mid-playback stall watchdog, and script cache key `safari-audio-stall-016`.
- Version setup, April 28, 2026: saved `v013-obstacle-wave-design-baseline` before beginning obstacle parameter and selective wave-mask design.

## Next Chat Starter

Use this when starting the next portion:

```text
We are continuing the Ocean Grid Prototype in E:\2026\Dev\Experiment\Hurricane Vendetta Demos\Cyber Surfer\ocean-grid-prototype.

Please read README.md, HANDOFF.md, and EVALUATION.md first. The current app runs directly from index.html with ordered classic scripts. Do not switch to npm/Vite unless explicitly needed.

Current direction: lofi Tempest-like vector ocean, lane-rail surfboard controls, front anchor dots, ease-out retarget movement, centered responsive surfboard art, full-grid audio-reactive visuals, and readable boost/slow terrain shown as colored grid lines that modulate forward world speed.

Current checkpoint: v013-obstacle-wave-design-baseline.

Next task: design obstacle and wave parameters one step at a time. Start with data definitions for obstacle classes: size, speed effect, color, lane/column span, row/depth span, and a placeholder vector marker attached to the center of a grid cell. Then define which rows/columns should receive constant wave generation and which should stay calm. Keep `PERFORMANCE.enableCanvasShadows`, `PERFORMANCE.enableAudioGlow`, and `PERFORMANCE.enableMobileStrokeReduction` false unless deliberately experimenting. Preserve the gesture-first audio fallback path and do not add scoring, collision, timer, or destination logic yet.
```
