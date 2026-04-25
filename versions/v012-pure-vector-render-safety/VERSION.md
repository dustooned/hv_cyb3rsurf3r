# v012 Pure Vector Render Safety

Preserves the active direct-file runtime after correcting the mobile audio/performance pass.

Included state:

- OGG-first source priority restored so the desktop music track drives visible audio reaction again.
- MP3, M4A, and checked-in WAV remain available as mobile/browser fallback sources.
- Source-specific audio debug status remains in place.
- Canvas shadow and glow effects are disabled by default through `PERFORMANCE.enableCanvasShadows` and `PERFORMANCE.enableAudioGlow`.
- Automatic mobile stroke-count reduction is disabled by default through `PERFORMANCE.enableMobileStrokeReduction`.
- Full vector grid/decor line density is the default render path to avoid flicker and quality dips.
- Mobile stroke/path reduction remains available as a manual config experiment only.
- Terrain generation, yellow target timing, scoring, collision, timer, and destination logic are unchanged.

Next intended change: test this pure-vector baseline on desktop and iPad/mobile first. If it is stable, tune audio reactivity through vector geometry/color/width only before re-enabling any shadows, glow, or stroke-count reduction.
