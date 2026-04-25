# Evaluation Notes

## Current Design Direction

The prototype is becoming an arcade-like ocean-grid game foundation. The strongest current identity is:

```text
Tempest-like vector ocean + procedural water movement + lane-rail surfboard control
```

## Progress So Far

- Clarified the visual direction from generic ocean grid to a Tempest-like vector playfield.
- Recovered from blank-screen issues by simplifying to a reliable direct-file runtime.
- Preserved the first working state before refactoring.
- Refactored into modules after the behavior worked.
- Added a secondary blue decorative layer to distinguish game zones.
- Added a foreground surfboard player marker.
- Replaced free X movement with lane-rail movement.
- Improved control feel from button-mashing to hold-pulse arcade motion.
- Tuned movement toward very-fast arcade response.
- Reduced reversal recoil by allowing mid-switch retargeting and changing lane motion to `easeOut`.

## Current Feel Assessment

What is working:

- The front lane dots make the control surface readable.
- Lane movement feels more appropriate than free pixel movement.
- Hold-pulse controls reduce button mashing.
- Direction changes now feel better because the board can retarget during an active lane shift.
- The modular code structure is ready for mechanics.

What needs more evaluation:

- Whether `38ms` ease-out lane movement is fast enough after longer playtesting.
- Whether lane dots should remain visible in the final visual style.
- Whether the board should visually follow the water surface or stay on a stable control rail.
- Whether wave geometry should affect movement, hazards, or scoring.

## User Evaluation Progress

Key decisions made:

- The project should stay a plain JavaScript Canvas experiment.
- Direct file loading is important for reliable iteration.
- Tempest-like perspective is the right visual reference.
- The raised wave belongs on the left side.
- The blue secondary decoration helps separate game zones.
- The surfboard should move by grid lanes, not free pixel sliding.
- Held movement should pulse musically instead of requiring repeated tapping.
- Opposite-direction correction should not feel like recoil; retargetable movement is preferred.

Current preference:

- Fast retargetable arcade lane switching.
- Strong visual anchoring at the bottom/front edge.
- Keep systems simple until mechanics are clearer.

## Next Evaluation Question

The next major design question is:

```text
What does the player do with the lanes?
```

Good first options:

- Avoid raised wave lanes.
- Collect markers moving from the horizon.
- Stay inside safe lanes as the ocean shifts.
- Use the wave as a timing hazard.
