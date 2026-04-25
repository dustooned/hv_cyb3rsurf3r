// WAVE
// Procedural scrolling water height for the grid.

function updateWave(time) {
  const { GRID } = window.OceanConfig;
  const state = window.OceanState;
  const audio = state.audio;
  const audioConfig = window.OceanConfig.AUDIO;
  const scroll = state.world.progress;
  const waveTravel = scroll * 8;
  const bassWave = audio.bass * audioConfig.bassWaveAmount;
  const trebleShimmer = audio.treble * audioConfig.trebleShimmerAmount;
  const fullGridBass = (audio.bass + audio.bassHit) * audioConfig.gridBassLiftAmount;
  const fullGridVolume = (audio.volume + audio.volumeHit) * audioConfig.gridVolumeLiftAmount;
  const hitLift = Math.max(audio.bassHit, audio.volumeHit) * audioConfig.gridHitLiftAmount;

  for (let row = 0; row < GRID.rows; row += 1) {
    // Moving depth makes rows appear from the horizon and travel toward the viewer.
    const baseDepth = row / GRID.rows;
    const depth = (baseDepth + scroll) % 1;

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = state.vertices[row][col];
      const colT = col / (GRID.cols - 1);
      const signedCol = colT * 2 - 1;

      // Repeating ridge: depth makes the wave travel through the scrolling grid.
      const ridge = Math.max(0, Math.sin((depth * 2.4 + waveTravel) * Math.PI * 2));
      const smallMotion =
        Math.sin((depth * 9 + signedCol * 4 + waveTravel * 2) * Math.PI) *
        (audioConfig.gridBaseRippleAmount + trebleShimmer);
      const gridRipple =
        Math.sin((depth * 7.5 + colT * 3.5 + waveTravel * 3.2) * Math.PI * 2) *
        (audio.treble + audio.trebleHit) *
        audioConfig.gridTrebleRippleAmount;

      vertex.depth = depth;
      vertex.waveHeight = ridge * (audioConfig.gridBaseWaveAmount + bassWave) + smallMotion;
      vertex.audioHeight = fullGridBass * ridge + fullGridVolume + hitLift + gridRipple;
    }
  }
}

window.OceanWave = {
  updateWave,
};
