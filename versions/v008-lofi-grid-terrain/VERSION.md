# v008 Lofi Grid Terrain

Snapshot after converting terrain from separate sprite patches into terrain-colored grid lines.

Changes:
- Reduced grid from 30x18 to 20x13.
- Reduced decor from 15 rings / 18 spokes to 7 rings / 9 spokes.
- Scaled player lane bounds and terrain patch lanes to the smaller grid.
- Added terrain query helpers for grid-line coloring.
- Disabled separate terrain sprite drawing by default.
- Kept terrain speed effects active through the same patch data.
