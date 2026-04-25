# v004 Infrastructure Baseline

Saved checkpoint before the next round of lane-speed tuning and infrastructure work.

## Purpose

This version preserves the current modular runtime as a stable baseline. It should match the active root project at the moment it was saved.

## Includes

- Direct `file:///` browser loading.
- Ordered classic-script module infrastructure.
- Tempest-like scrolling ocean grid.
- Blue decorative side-zone layer.
- Foreground surfboard vector player.
- Front-edge lane anchor dots.
- Hold-pulse lane controls using the current very-fast arcade timing:

```js
laneMoveDuration: 50,
holdInitialDelay: 90,
holdPulseInterval: 50,
```

## Next Intended Work

- Continue evaluating and tuning lane-change speed.
- Consider whether movement timing should use a named preset system.
- Consider separating control-feel presets from player visual settings.
