// WAVE
// Procedural scrolling water height for the grid.

function updateWave(time) {
  const { GRID } = window.OceanConfig;
  const state = window.OceanState;
  const scroll = time * GRID.scrollSpeed;
  const waveTravel = time * 0.0014;

  for (let row = 0; row < GRID.rows; row += 1) {
    // Moving depth makes rows appear from the horizon and travel toward the viewer.
    const baseDepth = row / GRID.rows;
    const depth = (baseDepth + scroll) % 1;

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = state.vertices[row][col];
      const colT = col / (GRID.cols - 1);
      const signedCol = colT * 2 - 1;

      // Left mask keeps the raised geometry on the left side.
      const leftMask = Math.exp(-Math.pow((signedCol + 0.65) / 0.32, 2));

      // Repeating ridge: depth makes the wave travel through the scrolling grid.
      const ridge = Math.max(0, Math.sin((depth * 2.4 + waveTravel) * Math.PI * 2));
      const smallMotion =
        Math.sin((depth * 9 + signedCol * 4 + waveTravel * 2) * Math.PI) * 0.25;

      vertex.depth = depth;
      vertex.waveHeight = (ridge + smallMotion) * leftMask;
    }
  }
}

window.OceanWave = {
  updateWave,
};
