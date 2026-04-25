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
3. Define what the player avoids or collects.
4. Add one simple incoming obstacle/hazard tied to lane plus row depth.
5. Save another version snapshot before adding collision or scoring.
