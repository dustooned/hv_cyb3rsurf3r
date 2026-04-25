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

## Active Controls

- `ArrowLeft` or `A`: move left one lane, or pulse left while held.
- `ArrowRight` or `D`: move right one lane, or pulse right while held.

Current arcade timing in `src/config.js`:

```js
laneMoveDuration: 50,
holdInitialDelay: 90,
holdPulseInterval: 50,
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

## Lessons Learned

- Start with a working one-file prototype when browser loading is uncertain.
- Once behavior works, refactor into modules without changing visuals.
- Keep direct tuning in `src/config.js`; do not bury magic numbers inside rendering code.
- Cache-busting query strings on scripts help direct-file browser reloads pick up changes.
- Lane-based control fits this Tempest/ocean-grid direction better than free pixel movement.
- Visual anchor dots on the front rail help debug lane feel and player position.

## Recommended Next Steps

1. Test whether `50ms` lane movement is too fast after a longer play session.
2. Decide whether the lane dots are permanent UI, debug-only, or stylized game markers.
3. Define what the player avoids or collects.
4. Add one simple incoming obstacle/hazard tied to lane plus row depth.
5. Save another version snapshot before adding collision or scoring.
