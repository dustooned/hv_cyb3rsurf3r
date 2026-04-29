# Evaluation Notes

## Current Design Direction

The prototype is becoming an arcade-like ocean-grid game foundation. The strongest current identity is:

```text
Tempest-like vector ocean + procedural water movement + lane-rail surfboard control
```

## Progress So Far

- Clarified the visual direction from generic ocean grid to a Tempest-like vector playfield.
- Recovered from blank-screen issues by simplifying to a reliable direct-file runtime.
- Preserved the first working state before refactoring.
- Refactored into modules after the behavior worked.
- Added a secondary blue decorative layer to distinguish game zones.
- Added a foreground surfboard player marker.
- Replaced free X movement with lane-rail movement.
- Improved control feel from button-mashing to hold-pulse arcade motion.
- Tuned movement toward very-fast arcade response.
- Reduced reversal recoil by allowing mid-switch retargeting and changing lane motion to `easeOut`.

## Current Feel Assessment

What is working:

- The front lane dots make the control surface readable.
- Lane movement feels more appropriate than free pixel movement.
- Hold-pulse controls reduce button mashing.
- Direction changes now feel better because the board can retarget during an active lane shift.
- The modular code structure is ready for mechanics.
- Boost and slow terrain now have separate color and shape language.
- Forward ocean/world speed now changes from terrain sampling instead of lane-change speed.
- The surfboard now feels more attached to the active rail point because it is centered on the lane dot and follows the projected grid angle.
- The audio/FPS debug readout is useful for separating "not playing" from "wrong source" from "not reacting" from "rendering too slowly."

What needs more evaluation:

- Whether `38ms` ease-out lane movement is fast enough after longer playtesting.
- Whether lane dots should remain visible in the final visual style.
- Whether the board should visually follow the water surface or stay on a stable control rail.
- Whether wave geometry should affect movement, hazards, or scoring.
- Whether the dashed terrain sample line is the right depth cue or should become invisible/debug-only.
- Whether terrain patch size and speed multipliers are readable during normal lane movement.
- Which obstacle classes need distinct size, speed, color, and marker-shape parameters.
- Whether center-cell vector placeholders stay readable when attached to projected grid geometry.
- Which rows and columns should carry constant wave generation, and which areas should remain calm.
- Whether full-grid audio response should be more line-glow-driven and less vertex-height-driven.
- Whether the audio debug readout should stay as a tuning overlay or become hidden after diagnostics.
- Whether the first mobile performance-mode stride values reduce iPad stroke/path cost enough without losing too much grid readability.

## User Evaluation Progress

Key decisions made:

- The project should stay a plain JavaScript Canvas experiment.
- Direct file loading is important for reliable iteration.
- Tempest-like perspective is the right visual reference.
- The raised wave belongs on the left side.
- The blue secondary decoration helps separate game zones.
- The surfboard should move by grid lanes, not free pixel sliding.
- Held movement should pulse musically instead of requiring repeated tapping.
- Opposite-direction correction should not feel like recoil; retargetable movement is preferred.

Current preference:

- Fast retargetable arcade lane switching.
- Strong visual anchoring at the bottom/front edge.
- Keep systems simple until mechanics are clearer.
- Keep gameplay anchors grid-relative, but let art dimensions scale responsively.
- Preserve debug readouts until audio and frame-rate problems are understood.

## Journal

### 2026-04-25 - v009 Audio-Reactive Terrain Baseline

- Preserved yellow timing rail target, OGG-first audio analysis, WAV fallback path, terrain pulse, wave shimmer, and white grid glow reactivity.
- Audio remained visual-only and did not affect terrain generation, timing spawns, scoring, collision, timer, or destination logic.

### 2026-04-25 - Full-Grid Audio Response

- Broadened audio response from the old left-side wave mask to the whole main grid.
- Added whole-grid audio vertex lift and line glow controls in `AUDIO.*`.
- Removed the residual left-side height mask after it kept making one side of the grid too tall.
- Reduced always-on mechanical wave motion so music-driven transient hits could read more clearly.

### 2026-04-25 - Surfboard Centering And Responsive Art

- Moved the surfboard from a screen-space upward offset to a center anchor on the active projected lane rail point.
- Rotated the board toward the projected lane direction while preserving visual movement tilt.
- Added responsive board art scaling based on projected rail spacing so desktop, tablet, and phone sizes can keep the same gameplay anchor while changing art dimensions.

### 2026-04-25 - Audio And Performance Diagnostic Pass

- Added audio status and amplitude readout for bass, treble, and volume.
- Added FPS and adaptive glow-scale readout.
- Added pointer, mouse, click, touch, and keyboard gesture paths to initiate audio.
- Removed `crossOrigin = "anonymous"` from the local file audio element to avoid extra local-media friction.
- Added `PERFORMANCE.*` controls for pixel-ratio caps, adaptive glow scaling, and lower-detail decorative paths.
- Verified that the in-app Chromium browser can show `audio: playing` and moving meters after input, but user reports Chrome/Brave and iPad/mobile still have unreliable sound initiation.
- Identified likely iPad/mobile issue: current preferred source is `test.ogg`, while iOS Safari-family browsers generally need MP3/M4A/AAC/WAV. The folder currently has `test.ogg`, not `test.wav`.
- Identified likely FPS issue: when `glowScale` bottoms out and FPS is still low, the bottleneck is probably total Canvas stroke/path count rather than only glow blur.

### 2026-04-25 - Mobile Audio And Stroke-Count Pass

- Added a checked-in generated `assets/audio/test.wav` so mobile/iPad browsers have a safer local source than OGG.
- Changed audio source order to WAV, MP3, M4A, then OGG, and added source-specific debug status.
- Kept first pointer/touch/click/key audio start direct through `OceanAudio.startAudio()`.
- Added mobile render mode diagnostics and reduced grid/decor stroke/path count through stride and path-step settings.

### 2026-04-25 - Pure Vector Safety Correction

- Reverted the default audio priority back to OGG-first so the desktop music track drives visible reaction again.
- Kept MP3/M4A/WAV as fallback sources, with explicit source fallback when a selected file fails.
- Disabled Canvas shadow/glow effects by default through `PERFORMANCE.enableCanvasShadows` and `PERFORMANCE.enableAudioGlow`.
- Disabled automatic mobile stroke-count reduction by default so the grid keeps full vector line density and avoids flicker/quality dips.

### 2026-04-25 - Simple Multi-Format Audio Fallback

- Kept the prototype on the simple custom audio manager instead of adding an audio library.
- Standardized the intended source set as OGG, MP3, M4A, and WAV versions of the same mixed track.
- Added a short per-source startup timeout so the loader can fall through when a browser accepts a format but does not actually begin playback.
- User reported the procedure working in Chrome and Brave desktop after the fallback file pass.
- Temporarily enabled delayed auto-start so the browser gets a brief preload window before playback is attempted; gesture fallback remains active for browsers that block autoplay.
- After mobile testing showed false `playing` status, added mobile-specific MP3/M4A/WAV ordering and a playback-time-advance check before declaring a source live.
- After mobile stayed at `audio: starting` on `test.ogg`, removed OGG from the mobile source list, bumped browser cache keys, and added an audio-context resume timeout.
- Disabled delayed autoplay again after it caused sources to be consumed before reliable audio unlock; gesture-first is the current reliable baseline.
- Final result for this pass: desktop keeps OGG-first music reaction, mobile uses MP3/M4A/WAV only, and the prototype reliably starts audio after one real tap/click/key gesture.

### 2026-04-28 - Safari Audio Stall And v013 Setup

- Added a Safari-specific MP3/M4A/WAV source list so desktop Safari does not enter the OGG-first path.
- Added a playback health watchdog so a source that starts and then stops advancing can fall through instead of staying falsely marked as playing.
- Saved `v013-obstacle-wave-design-baseline` before adding new obstacle or wave-mask runtime behavior.
- The next design pass should focus on obstacle class data, center-cell vector placeholder markers, color coding, and row/column wave masks.

Next diagnostic question:

```text
After the gesture-first fallback is deployed, do iPad Safari and Android show `selected: test.mp3 (mobile)` and moving bass/treble/volume meters after one tap?
```

## Next Evaluation Question

The next major design question is:

```text
How should classified obstacles and selective wave bands sit on top of the terrain grid?
```

Current answer to test next:

- Obstacle classes should be data-first: size, speed effect, color, marker shape, lane/column span, and row/depth span.
- Placeholder vector graphics should attach to the projected center of a grid cell.
- Color should reinforce the class, but shape should carry meaning too.
- Constant wave generation should be allowed in selected rows/columns/cells while other grid areas remain calm.
- Collision, scoring, timer, and destination rules should wait until obstacle readability is proven.

## Terrain Design Notes

The next mechanic should treat the ocean grid as gameplay terrain, not just a visual surface.

Recommended first terrain types:

- `boost`: bright cyan/green, chevron or arrow-like pattern, smooth raised-ridge shape, increases forward world speed.
- `slow`: dark blue/purple, rounded pool/blob pattern, lower drag-like shape, reduces forward world speed.

Design rules:

- Shape readability comes before visual complexity.
- Color reinforces the terrain type but should not be the only signal.
- Fractal/noise detail should modify shape edges or internal texture, not destroy the readable silhouette.
- Start with terrain affecting `GRID.scrollSpeed` or a future `currentWorldSpeed`; do not affect lane-change speed yet.
- Do not add scoring, collision, timer, or destination UI until boost/slow terrain can be seen and classified clearly.

## Current Terrain Test

Implemented test answer:

- `OceanState.world.progress` now drives forward grid scrolling.
- `src/terrain.js` updates `currentSpeed`, `targetSpeed`, `speedMultiplier`, and the active terrain classification.
- Boost patches use cyan/green chevrons.
- Slow patches use purple rounded pools.
- Optional noisy edges are controlled by `TERRAIN.edgeNoise`.
- The terrain sample is lane plus depth based, not a scoring/collision system.

Next evaluation:

- Confirm whether players understand that chevrons mean faster and pools mean slower without text.
- Tune `TERRAIN.sampleDepth` so the speed change happens when the board visually feels like it has entered terrain.
- Decide whether the dashed probe line should become a styled game marker, a debug toggle, or hidden.
- Decide the first two or three obstacle classes and their placeholder marker shapes.
- Choose the first row/column ranges for testing constant wave bands.
