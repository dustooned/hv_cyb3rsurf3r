# v006 Terrain Speed Prototype

Preserves the first readable terrain classification prototype.

## Included Behavior

- Boost terrain: cyan/green chevron fields.
- Slow terrain: purple rounded pools.
- Explicit patch data in `TERRAIN.patches`.
- Forward world progress in `OceanState.world.progress`.
- Terrain speed sampling at `TERRAIN.sampleDepth`.
- Wave height remains visual-only.

## Deferred On Purpose

- No scoring.
- No collision system.
- No timer.
- No destination UI.
