// GRID
// Creates, projects, and draws the Tempest-like ocean grid.

function createGrid() {
  const { GRID } = window.OceanConfig;
  const state = window.OceanState;

  state.vertices = [];

  for (let row = 0; row < GRID.rows; row += 1) {
    const rowVertices = [];

    for (let col = 0; col < GRID.cols; col += 1) {
      rowVertices.push({
        baseX: col,
        baseY: row,
        x: 0,
        y: 0,
        row,
        col,
        depth: 0,
        waveHeight: 0,
      });
    }

    state.vertices.push(rowVertices);
  }
}

function projectGrid() {
  const { GRID, VIEW } = window.OceanConfig;
  const state = window.OceanState;
  const centerX = state.width * 0.5;
  const horizonY = state.height * VIEW.horizonY;
  const frontY = state.height * VIEW.frontY;
  const frontHalfWidth = state.width * VIEW.frontHalfWidth;
  const backHalfWidth = state.width * VIEW.backHalfWidth;

  for (let row = 0; row < GRID.rows; row += 1) {
    const rowDepth = state.vertices[row][0].depth;
    const depth = rowDepth * rowDepth;
    const screenY = horizonY + (frontY - horizonY) * depth;
    const halfWidth = backHalfWidth + (frontHalfWidth - backHalfWidth) * depth;
    const lift = depth * VIEW.waveLift;

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = state.vertices[row][col];
      const colT = col / (GRID.cols - 1);
      const signedCol = colT * 2 - 1;

      vertex.x = centerX + signedCol * halfWidth;
      vertex.y = screenY - vertex.waveHeight * lift;
    }
  }
}

function drawGrid() {
  const { GRID } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(60, 255, 220, 0.7)";
  ctx.shadowBlur = 8;

  const rowsByDepth = [...state.vertices].sort((a, b) => a[0].depth - b[0].depth);

  for (let row = 0; row < rowsByDepth.length; row += 1) {
    const rowVertices = rowsByDepth[row];

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = rowVertices[col];

      if (col < GRID.cols - 1) {
        drawLine(vertex, rowVertices[col + 1]);
      }

      if (row < rowsByDepth.length - 1) {
        drawLine(vertex, rowsByDepth[row + 1][col]);
      }
    }
  }
}

function drawLine(a, b) {
  const ctx = window.OceanState.ctx;
  const wave = Math.max(a.waveHeight, b.waveHeight);
  const terrain = window.OceanTerrain.getTerrainVisualAt(
    (a.col + b.col) * 0.5,
    getLineSampleDepth(a.depth, b.depth),
  );
  const alpha = Math.max(0.35, Math.min(1, 0.55 + wave * 0.7 + terrain.alpha * 0.18));

  if (terrain.type === "boost") {
    ctx.strokeStyle = `rgba(70, 255, 175, ${Math.max(alpha, 0.78)})`;
    ctx.lineWidth = 2;
  } else if (terrain.type === "slow") {
    ctx.strokeStyle = `rgba(170, 135, 255, ${Math.max(alpha, 0.68)})`;
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle =
      wave > 0.45
        ? `rgba(240, 255, 255, ${alpha})`
        : `rgba(70, 255, 210, ${alpha})`;
    ctx.lineWidth = wave > 0.45 ? 2 : 1;
  }

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function getLineSampleDepth(aDepth, bDepth) {
  const distance = Math.abs(aDepth - bDepth);

  if (distance > 0.5) {
    return ((aDepth + bDepth + 1) * 0.5) % 1;
  }

  return (aDepth + bDepth) * 0.5;
}

window.OceanGrid = {
  createGrid,
  projectGrid,
  drawGrid,
};
