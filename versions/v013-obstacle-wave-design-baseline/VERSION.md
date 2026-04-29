# v013 Obstacle Wave Design Baseline

Preserves the active direct-file runtime before adding the next grid-design layer.

Included state:

- Pure-vector render safety remains the default: Canvas shadows, audio glow, and automatic stroke-count reduction stay disabled.
- Gesture-first audio remains the baseline.
- Non-Safari desktop keeps OGG-first playback.
- Safari and mobile use MP3/M4A/WAV fallback source lists.
- Mid-playback audio stalls can fall through to the next source instead of staying falsely marked as playing.
- Terrain generation, yellow target timing, scoring, collision, timer, and destination logic are unchanged.

Next intended change:

- Design classified obstacle data with size, speed effect, color, lane/column span, row/depth span, and placeholder vector marker shape.
- Attach lightweight vector placeholders to the projected center of grid cells.
- Explore selective constant wave generation by row/column/cell ranges while leaving other grid regions calm.
- Keep the work incremental: define the first classes and masks before adding collision, scoring, timer, or destination behavior.
