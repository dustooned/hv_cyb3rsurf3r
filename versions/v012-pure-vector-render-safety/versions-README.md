# Prototype Versions

This folder stores manual snapshots of working prototype states.

The root project folder remains the active working copy. When a prototype state feels worth preserving, copy the active files into a new `v###-description` folder here.

## Current Snapshots

- `v001-current-working-prototype`: first working arcade ocean grid with scrolling horizon rows, blue decorative side layer, and keyboard-controlled foreground surfboard.
- `v002-modular-runtime`: same visible behavior split into focused classic-script modules.
- `v003-very-fast-arcade-lane-rail`: current checkpoint with front-edge lane dots and very-fast hold-pulse surfboard controls.
- `v004-infrastructure-baseline`: stable modular baseline before the next round of lane-speed tuning and infrastructure work.
- `v005-retarget-easeout-controls`: approved checkpoint with faster retargetable ease-out lane controls before expansion.
- `v006-terrain-speed-prototype`: first readable boost/slow terrain classification prototype with forward world-speed modulation.
- `v007-foreground-fade-baseline`: pre-lofi terrain-shape version with slower world speed, horizon clipping, foreground fade, and mobile canvas cleanup.
- `v008-lofi-grid-terrain`: lofi version that reduces grid/decor density and renders boost/slow terrain as colored main-grid lines.
- `v009-audio-reactive-terrain-baseline`: current checkpoint with yellow timing rail, OGG-first audio analysis, terrain pulse, wave shimmer, and white grid glow reactivity.
- `v010-centered-surfboard-audio-grid-baseline`: current checkpoint with full-grid audio visual response, lower mechanical wave amplitude, and a centered grid-angle surfboard anchor.
- `v011-audio-performance-diagnostic-baseline`: current checkpoint with responsive surfboard art scaling, audio-start diagnostics, FPS/glow readout, and performance throttling before deeper iPad/mobile fixes.
- `v012-pure-vector-render-safety`: current corrected checkpoint with OGG-first audio restored, mobile fallbacks retained, and Canvas shadows/glow/stroke-reduction bottlenecks disabled by default.

## Active Additions After v008

- Yellow timing rail prototype: Space-triggered timing target that requires lane alignment and grants a temporary high-speed boost.
- Audio-reactive visual prototype: optional `assets/audio/test.ogg` analysis drives wave height, terrain pulse, shimmer, and white grid glow without affecting gameplay generation.
- Surfboard placement pass: the board now anchors on the active lane rail point and follows the projected grid angle while preserving movement tilt.
- Mobile/browser diagnostic pass: current root tracks audio status and FPS, but iPad/mobile audio likely needs MP3/M4A/AAC and a lighter stroke-count render mode.
- Mobile audio/performance pass: current root includes checked-in `assets/audio/test.wav`, source-specific debug status, and config-gated Canvas shadow/glow plus optional mobile stroke reduction. The default rendering path keeps full vector line density.
- Pure-vector safety correction: current root keeps full grid/decor vector density, reports `vector` render mode, and leaves all expensive shadow/glow/stroke-reduction options off unless manually enabled in `src/config.js`.
