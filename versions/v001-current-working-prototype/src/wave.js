// Wave module.
// A moving ridge rises on the left side of the grid, then recedes infinitely.

const WAVE_SETTINGS = {
  travelSpeed: 0.0016,
  ridgeWidth: 2.2,
  leftBias: -0.72,
  leftSpread: 0.28,
  height: 1,
  secondaryHeight: 0.35,
};

function updateWave(grid, time) {
  const motion = time * WAVE_SETTINGS.travelSpeed;

  for (const rowVertices of grid.vertices) {
    for (const vertex of rowVertices) {
      const rowProgress = vertex.row / Math.max(grid.rows - 1, 1);
      const colProgress = vertex.col / Math.max(grid.cols - 1, 1);
      const signedCol = colProgress * 2 - 1;
      const loopingPhase = (rowProgress * WAVE_SETTINGS.ridgeWidth + motion) % 1;
      const ridge = Math.sin(loopingPhase * Math.PI);
      const leftMask = Math.exp(
        -Math.pow((signedCol - WAVE_SETTINGS.leftBias) / WAVE_SETTINGS.leftSpread, 2),
      );
      const secondary = Math.sin((rowProgress * 8 + signedCol * 3 + motion * 3) * Math.PI);
      const waveHeight =
        Math.max(0, ridge) * leftMask * WAVE_SETTINGS.height +
        secondary * leftMask * WAVE_SETTINGS.secondaryHeight;

      vertex.x = vertex.baseX;
      vertex.y = vertex.baseY + waveHeight;
      vertex.waveHeight = waveHeight;
    }
  }
}

window.OceanWave = {
  updateWave,
};
