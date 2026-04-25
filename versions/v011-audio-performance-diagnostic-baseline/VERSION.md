# v011 Audio Performance Diagnostic Baseline

Preserves the active direct-file runtime after the April 25, 2026 diagnostic pass.

Included state:

- Full-main-grid audio-reactive visuals after removing the old left-side wave mask.
- Reduced always-on mechanical wave amplitude plus transient bass/treble/volume hit values.
- Surfboard centered on the active projected rail dot, rotated toward the grid lane direction.
- Responsive surfboard art scaling based on projected rail spacing.
- Audio debug readout showing playback status, bass, treble, and volume.
- FPS/glow debug readout plus adaptive glow scaling.
- Performance controls for Canvas pixel ratio and lower-detail decorative paths.
- Keyboard, pointer, mouse, click, and touch gesture paths for audio start attempts.
- Local audio binaries intentionally excluded; `assets/audio/.gitkeep` is preserved.

Known open issues:

- iPad/mobile browsers likely do not play the current preferred `assets/audio/test.ogg` source.
- Chrome/Brave on iPad use Safari/WebKit media behavior, so they likely need MP3/M4A/AAC.
- Slow iPad FPS likely needs stroke/path-count reduction, not only lower glow blur.

Next intended change: add a mobile-safe audio source and source-specific debug status, then add a mobile performance mode that reduces grid/decor stroke count while preserving gameplay anchors.
