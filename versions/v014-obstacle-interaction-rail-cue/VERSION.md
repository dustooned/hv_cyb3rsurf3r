# v014 Obstacle Interaction Rail Cue

Preserves the first active obstacle interaction pass after `v013-obstacle-wave-design-baseline`.

Included state:

- Direct-file runtime remains the baseline through `index.html` and ordered classic scripts.
- `src/obstacles.js` owns obstacle marker drawing, speed effects, Jumpwave activation, spacing warnings, row-wrap guarding, and the player-rail cue.
- `OBSTACLES.classes` defines Seaweed, Tide, and Jumpwave with separate visual, terrain effect, timing, collision label, and jump-effect data.
- Seaweed draws as a green projected checkerboard footprint and slows forward world speed.
- Tide draws as a magenta projected wave-band footprint and increases forward world speed.
- Jumpwave draws as a yellow projected vertical-wave footprint and activates from Space when it reaches the rail timing zone.
- Jumpwave activation no longer forces lane movement.
- Jumpwave activation starts temporary speed, a surfboard lift/hang/landing bounce, and a four-column movement cap from the activation lane.
- Jumpwave rail cue is a small circle on the player's current rail point, appears only shortly before the timing moment, and hides after a successful hit.
- Obstacle footprints skip drawing/collision while crossing the scrolling row-wrap seam to avoid horizon-to-foreground stretching.
- Warning-only placement checks report obstacle anchors closer than four vertices.
- Old boost/slow terrain patches and old yellow timing target visuals remain disabled for this obstacle-focused checkpoint.
- Performance safety flags remain false: `PERFORMANCE.enableCanvasShadows`, `PERFORMANCE.enableAudioGlow`, and `PERFORMANCE.enableMobileStrokeReduction`.
- Gesture-first audio fallback remains preserved with OGG-first desktop and MP3/M4A/WAV Safari/mobile source lists.

Important tuning points:

- Jumpwave cue timing: `OBSTACLES.classes[].jumpEffect.railCue.reactionTimeMs`.
- Jumpwave cue size: `OBSTACLES.classes[].jumpEffect.railCue.baseRadius` and `expandRadius`.
- Jumpwave airtime: `liftDuration`, `hangDuration`, and `landDuration`.
- Jumpwave movement limit: `jumpEffect.maxColumnHop`.
- Obstacle spacing warning: `OBSTACLES.placementRules.minVertexDistance`.
- Current cache key: `jumpwave-circle-cue-028`.

Known follow-up:

- Playtest whether the small player-rail cue appears at the right time and stays readable against wave motion.
- Decide whether a future horizon-line character/sprite should provide earlier Jumpwave warning before the rail cue.
- Decide whether Seaweed and Tide should remain direct speed zones or become timing/avoidance objects.
- Add selective wave masks by row/column/cell only after obstacle readability is stable.
- Keep scoring, failure, destination, timer, and full collision states deferred.
