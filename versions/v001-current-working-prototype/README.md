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
- `src/main.js` currently owns the full visible prototype in one file so the browser path is easy to debug.
- `src/canvas.js` is reserved for Canvas setup and drawing once the working one-file version is split apart again.
- `src/grid.js` is reserved for grid creation once the working one-file version is split apart again.
- `src/wave.js` is reserved for wave behavior once the working one-file version is split apart again.
- `src/input.js` is a placeholder for future mouse or pointer interaction.
