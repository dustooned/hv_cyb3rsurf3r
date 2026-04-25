# v005 Retarget Ease-Out Controls

Saved checkpoint for the current approved lane-control feel before adding new mechanics.

## Includes

- Modular direct-file Canvas runtime.
- Tempest-like scrolling ocean grid.
- Blue decorative side-zone layer.
- Foreground surfboard player on the front control rail.
- Front-edge lane anchor dots.
- Hold-pulse lane controls.
- Mid-switch retargeting for better opposite-direction correction.
- Ease-out lane motion to reduce sticky/recoil feel.

## Current Control Timing

```js
laneMoveDuration: 38,
holdInitialDelay: 70,
holdPulseInterval: 45,
laneEase: "easeOut",
allowLaneRetarget: true,
```

## Evaluation Note

This version is considered good enough for now. The next expansion should build mechanics on top of this control foundation, while continuing to watch whether lane speed needs finer tuning.
