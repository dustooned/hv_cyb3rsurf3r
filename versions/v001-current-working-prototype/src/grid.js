// Grid module.
// This creates the logical vertex data before the Canvas projects it.

function createGrid({ cols, rows, width }) {
  const worldWidth = width;
  const colStep = worldWidth / (cols - 1);
  const vertices = [];

  for (let row = 0; row < rows; row += 1) {
    const rowVertices = [];

    for (let col = 0; col < cols; col += 1) {
      const baseX = -worldWidth / 2 + col * colStep;
      const baseY = 0;

      rowVertices.push({
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        row,
        col,
        waveHeight: 0,
        depth: 0,
        screenX: 0,
        screenY: 0,
        brightness: 0,
      });
    }

    vertices.push(rowVertices);
  }

  return {
    cols,
    rows,
    vertices,
  };
}

window.OceanGrid = {
  createGrid,
};
