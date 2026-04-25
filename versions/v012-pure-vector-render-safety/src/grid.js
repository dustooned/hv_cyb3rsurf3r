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
        audioHeight: 0,
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
      vertex.y = screenY - (vertex.waveHeight + vertex.audioHeight) * lift;
    }
  }
}

function drawGrid() {
  const { GRID, PERFORMANCE } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const glowScale = state.performance.glowScale;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(60, 255, 220, 0.7)";
  ctx.shadowBlur = PERFORMANCE.enableCanvasShadows ? 8 * glowScale : 0;

  const rowsByDepth = [...state.vertices].sort((a, b) => a[0].depth - b[0].depth);

  for (let row = 0; row < rowsByDepth.length; row += 1) {
    const rowVertices = rowsByDepth[row];

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = rowVertices[col];

      if (col < GRID.cols - 1 && shouldDrawHorizontalLine(rowVertices[0], col)) {
        drawLine(vertex, rowVertices[col + 1]);
      }

      if (row < rowsByDepth.length - 1 && shouldDrawVerticalLine(vertex)) {
        drawLine(vertex, rowsByDepth[row + 1][col]);
      }
    }
  }
}

function shouldDrawHorizontalLine(rowStartVertex, col) {
  const { PERFORMANCE } = window.OceanConfig;
  const perf = window.OceanState.performance;

  if (!PERFORMANCE.enableMobileStrokeReduction || !perf.mobileMode) {
    return true;
  }

  const rowStride = Math.max(1, PERFORMANCE.mobileGridRowStride);
  const colStride = Math.max(1, PERFORMANCE.mobileGridColumnStride);

  return rowStartVertex.row % rowStride === 0 && col % colStride === 0;
}

function shouldDrawVerticalLine(vertex) {
  const { PERFORMANCE } = window.OceanConfig;
  const perf = window.OceanState.performance;

  if (!PERFORMANCE.enableMobileStrokeReduction || !perf.mobileMode) {
    return true;
  }

  const colStride = Math.max(1, PERFORMANCE.mobileGridColumnStride);

  return vertex.col % colStride === 0;
}

function drawLine(a, b) {
  const ctx = window.OceanState.ctx;
  const performance = window.OceanState.performance;
  const performanceConfig = window.OceanConfig.PERFORMANCE;
  const audio = window.OceanState.audio;
  const audioConfig = window.OceanConfig.AUDIO;
  const glowScale = performance.glowScale;
  const wave = Math.max(a.waveHeight, b.waveHeight);
  const gridPulse = getLineAudioPulse(a, b);
  const lineEnergy = Math.max(wave, gridPulse);
  const glowLift = audio.volume * audioConfig.volumeGlowAmount;
  const whiteThreshold = 0.45 - audio.volume * audioConfig.whiteThresholdShift;
  const terrain = window.OceanTerrain.getTerrainVisualAt(
    (a.col + b.col) * 0.5,
    getLineSampleDepth(a.depth, b.depth),
  );
  const alpha = Math.max(0.35, Math.min(1, 0.55 + wave * 0.5 + gridPulse * 0.52 + terrain.alpha * 0.18 + glowLift));

  if (terrain.type === "boost") {
    strokeTerrainLine(a, b, "boost", "rgba(55, 255, 180, 0.26)", `rgba(70, 255, 175, ${Math.max(alpha, 0.84)})`);
    return;
  } else if (terrain.type === "slow") {
    strokeTerrainLine(a, b, "slow", "rgba(190, 115, 255, 0.28)", `rgba(198, 145, 255, ${Math.max(alpha, 0.78)})`);
    return;
  } else {
    ctx.shadowColor = "rgba(60, 255, 220, 0.7)";
    ctx.shadowBlur = performanceConfig.enableCanvasShadows
      ? (8 + audio.volume * 10 + gridPulse * audioConfig.gridPulseGlowAmount) * glowScale
      : 0;
    ctx.strokeStyle =
      lineEnergy > whiteThreshold
        ? `rgba(240, 255, 255, ${alpha})`
        : `rgba(70, 255, 210, ${alpha})`;
    ctx.lineWidth = (lineEnergy > whiteThreshold ? 2 : 1) +
      (performanceConfig.enableAudioGlow ? gridPulse * audioConfig.gridPulseWidthAmount * glowScale : 0);
  }

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function strokeTerrainLine(a, b, terrainType, glowColor, coreColor) {
  const ctx = window.OceanState.ctx;
  const performance = window.OceanState.performance;
  const performanceConfig = window.OceanConfig.PERFORMANCE;
  const audio = window.OceanState.audio;
  const audioConfig = window.OceanConfig.AUDIO;
  const glowScale = performance.glowScale;
  const terrainPulse = terrainType === "boost"
    ? Math.max(audio.bass, audio.volume)
    : Math.max(audio.treble, audio.volume);
  const glowBlur = performanceConfig.enableCanvasShadows
    ? (16 + terrainPulse * audioConfig.terrainGlowAmount) * glowScale
    : 0;
  const glowWidth = performanceConfig.enableAudioGlow
    ? 3 + (2 + terrainPulse * audioConfig.terrainWidthAmount) * glowScale
    : 2.6;
  const coreWidth = 2.4 + terrainPulse * audioConfig.terrainWidthAmount * 0.35;

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = glowBlur;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = glowWidth;
  if (performanceConfig.enableAudioGlow) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.shadowBlur = performanceConfig.enableCanvasShadows
    ? (10 + terrainPulse * audioConfig.terrainGlowAmount * 0.45) * glowScale
    : 0;
  ctx.strokeStyle = coreColor;
  ctx.lineWidth = coreWidth;
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

function getLineAudioPulse(a, b) {
  const audio = window.OceanState.audio;
  const depth = getLineSampleDepth(a.depth, b.depth);
  const nearField = 0.35 + depth * 0.65;
  const vertexLift = Math.max(a.audioHeight, b.audioHeight);

  return Math.min(
    1,
    (
      audio.bass * 0.24 +
      audio.treble * 0.16 +
      audio.volume * 0.28 +
      audio.bassHit * 0.42 +
      audio.trebleHit * 0.24 +
      audio.volumeHit * 0.34 +
      vertexLift * 1.45
    ) * nearField,
  );
}

window.OceanGrid = {
  createGrid,
  projectGrid,
  drawGrid,
};
