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

What needs more evaluation:

- Whether `38ms` ease-out lane movement is fast enough after longer playtesting.
- Whether lane dots should remain visible in the final visual style.
- Whether the board should visually follow the water surface or stay on a stable control rail.
- Whether wave geometry should affect movement, hazards, or scoring.
- Whether the dashed terrain sample line is the right depth cue or should become invisible/debug-only.
- Whether terrain patch size and speed multipliers are readable during normal lane movement.

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

## Next Evaluation Question

The next major design question is:

```text
How does terrain on the ocean grid affect forward progress?
```

Current answer to test next:

- The player is trying to reach a destination before time runs out.
- Terrain changes the forward ocean/world speed.
- Boost terrain increases progress speed.
- Slow terrain reduces progress speed.
- Terrain should be color-classified and shape-classified so the player can read it quickly.
- Wave height should stay visual-only until terrain rules are clearer.

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
