# v002 Modular Runtime

Saved snapshot of the first behavior-preserving modular runtime.

## Includes

- Direct `file:///` loading through ordered classic scripts.
- `src/config.js` for tuning values.
- `src/state.js` for shared runtime state.
- `src/canvas.js` for Canvas setup and background drawing.
- `src/grid.js` for grid creation, projection, and drawing.
- `src/wave.js` for procedural scrolling row depth and wave height.
- `src/decor.js` for the blue side-zone decoration.
- `src/player.js` for the foreground surfboard marker.
- `src/input.js` for Arrow Left, Arrow Right, A, and D key state.
- `src/main.js` for startup and the animation loop only.

## Notes

This version should look and play like `v001-current-working-prototype`, but the code is split into ownership-focused modules.
