# Ocean Grid Prototype Handoff

## Current Status

The active root project is a working modular HTML5 Canvas arcade prototype. It is designed to run directly from:

```text
file:///E:/OneDrive/Documents/New%20project/ocean-grid-prototype/index.html
```

No npm install is required for the current browser path.

## What We Built

- A Tempest-like ocean grid rendered with Canvas vector lines.
- A finite set of grid rows that scroll from the horizon toward the player, creating an infinite procedural water illusion.
- A left-side raised wave feature that gives the ocean geometry asymmetry and game-readability.
- A brighter blue decorative side-zone layer clipped outside the central playfield.
- A foreground surfboard-like vector player marker.
- Lane-rail movement along the closest/front edge of the grid.
- Hold-pulse controls so the board can move rhythmically across lanes while a key is held.
- Ease-out lane movement and mid-switch retargeting so quick direction reversals feel less like recoil.
- Boost and slow terrain patches drawn as readable abstract shapes on the play grid.
- Terrain sampling that changes forward ocean/world speed without adding scoring, collision, timer, or destination logic.

## Active Controls

- `ArrowLeft` or `A`: move left one lane, or pulse left while held.
- `ArrowRight` or `D`: move right one lane, or pulse right while held.

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
- `grid.js`: grid creation, projection, and drawing.
- `wave.js`: procedural row depth and wave height.
- `decor.js`: blue decorative side-zone rendering.
- `terrain.js`: terrain patch data, shape drawing, and speed sampling.
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

## Lessons Learned

- Start with a working one-file prototype when browser loading is uncertain.
- Once behavior works, refactor into modules without changing visuals.
- Keep direct tuning in `src/config.js`; do not bury magic numbers inside rendering code.
- Cache-busting query strings on scripts help direct-file browser reloads pick up changes.
- Lane-based control fits this Tempest/ocean-grid direction better than free pixel movement.
- Visual anchor dots on the front rail help debug lane feel and player position.
- Committed lane switches can feel like recoil when reversing direction; retargeting from the current visual lane feels better.
- `easeOut` makes lane correction feel faster and less sticky than the earlier ease-in-out switch.

## Recommended Next Steps

1. Continue testing whether `38ms` ease-out movement is fast enough after longer play.
2. Decide whether lane dots are permanent UI, debug-only, or stylized game markers.
3. Prototype terrain classification as the next major mechanic.
4. Use terrain to affect forward ocean/world speed, not lane-change speed.
5. Start with two readable terrain types before adding hazards or scoring:
   - Boost terrain: bright cyan/green, arrow or chevron-like shape language, increases world speed.
   - Slow terrain: darker blue/purple, rounded pool/blob shape language, reduces world speed.
6. Keep terrain shapes readable first, then add fractal/noisy edge detail second.
7. Save another version snapshot before adding collision, timer, scoring, or destination logic.

## Current Terrain Prototype

Terrain is intentionally separate from wave height:

- `src/config.js` has `TERRAIN` tuning for base speed, boost/slow multipliers, sample depth, edge noise, and patch definitions.
- `OceanState.world.progress` is the single forward-scroll value consumed by `src/wave.js`.
- `src/terrain.js` samples the player's current lane against visible terrain at `TERRAIN.sampleDepth`.
- Boost patches are cyan/green chevron fields; slow patches are purple rounded pools.
- The dashed probe line marks the depth where terrain affects forward speed.
- No scoring, collision, timer, destination, or failure states have been added.

## Next Chat Starter

Use this when starting the next portion:

```text
We are continuing the Ocean Grid Prototype in E:\OneDrive\Documents\New project\ocean-grid-prototype.

Please read README.md, HANDOFF.md, and EVALUATION.md first. The current app runs directly from index.html with ordered classic scripts. Do not switch to npm/Vite unless explicitly needed.

Current direction: Tempest-like vector ocean, lane-rail surfboard controls, front anchor dots, ease-out retarget movement, surfboard tilt, and readable boost/slow terrain that modulates forward world speed.

Next task: playtest whether the terrain sample line and shape language are readable at speed. Tune `TERRAIN.sampleDepth`, patch sizes, and `boostMultiplier`/`slowMultiplier` before adding scoring, collision, timer, or destination logic.
```
