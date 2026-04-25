# Ocean Grid Prototype

An HTML5 Canvas prototype for a procedural ocean-like vector grid.

The current direction is a minimal Tempest-like arcade grid: a perspective-projected wire plane with an infinite procedural wave ridge rising on the left side. This is meant to support early game mechanic exploration, visual background work, interactive art, and technical demo iteration.

## Install Dependencies

```bash
npm install
```

## Run The Prototype

```bash
npm run dev
```

Vite will print a local URL in the terminal. Open that URL in a browser to view the animated grid.

You can also open `index.html` directly in a browser for a quick file-based preview.

## Source Files

- `index.html` creates the page and loads the Canvas app.
- `styles/style.css` makes the Canvas fill the full browser window.
- `src/config.js` owns the main tuning values for the grid, view, decoration, and player.
- `src/state.js` owns shared runtime state like canvas size, vertices, keys, and player position.
- `src/canvas.js` owns Canvas setup, resizing, and background drawing.
- `src/grid.js` creates, projects, and draws the Tempest-like ocean grid.
- `src/wave.js` updates procedural water height and scrolling row depth.
- `src/decor.js` draws the blue procedural side-zone decoration.
- `src/player.js` updates and draws the foreground surfboard marker.
- `src/input.js` listens for Arrow Left, Arrow Right, A, and D.
- `src/main.js` owns only startup and the animation loop.

## Version Snapshots

- `versions/v001-current-working-prototype` preserves the first working one-file runtime.
- `versions/v002-modular-runtime` preserves the first behavior-preserving modular runtime.
