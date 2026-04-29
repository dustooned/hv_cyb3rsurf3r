// OBSTACLES
// Draws placeholder obstacle markers and exposes lightweight terrain/timing effects.

function drawObstacles(time) {
  const { OBSTACLES } = window.OceanConfig;

  if (!OBSTACLES.enabled) {
    return;
  }

  for (let i = 0; i < OBSTACLES.placements.length; i += 1) {
    const placement = OBSTACLES.placements[i];
    const obstacleClass = getObstacleClass(placement.type);

    if (!obstacleClass) {
      continue;
    }

    drawObstacleMarker(placement, obstacleClass, time);
  }
}

function updateObstacles(time) {
  const state = window.OceanState;
  const active = getObstacleAtPlayerRail();

  state.obstacles.activeId = active ? active.placement.id : null;
  state.obstacles.activeType = active ? active.obstacleClass.type : "none";
  state.obstacles.speedMultiplier = getObstacleSpeedMultiplier(active, time);
}

function requestObstacleAction(time) {
  const active = getObstacleAtPlayerRail();

  if (!active || active.obstacleClass.type !== "jumpwave") {
    return false;
  }

  const { obstacleClass, placement } = active;

  if (!obstacleClass.timing.enabled) {
    return false;
  }

  startPlayerJumpVisual(obstacleClass, time);

  window.OceanState.obstacles.jumpBoostUntil = time + obstacleClass.terrainEffect.duration;
  window.OceanState.obstacles.jumpLaneStart = Math.round(window.OceanState.player.lane);
  window.OceanState.obstacles.jumpMaxColumnHop = obstacleClass.jumpEffect.maxColumnHop;
  window.OceanState.obstacles.feedbackId = placement.id;
  window.OceanState.obstacles.feedbackUntil = time + 260;
  return true;
}

function startPlayerJumpVisual(obstacleClass, time) {
  const player = window.OceanState.player;
  const jumpEffect = obstacleClass.jumpEffect;

  player.jumpStartedAt = time;
  player.jumpLiftPixels = jumpEffect.liftPixels;
  player.jumpLiftDuration = jumpEffect.liftDuration;
  player.jumpHangDuration = jumpEffect.hangDuration;
  player.jumpLandDuration = jumpEffect.landDuration;
  player.jumpBouncePixels = jumpEffect.bouncePixels;
}

function getObstacleSpeedMultiplier(active, time) {
  const obstacleState = window.OceanState.obstacles;

  if (time < obstacleState.jumpBoostUntil) {
    return getObstacleClass("jumpwave").terrainEffect.value;
  }

  if (!active || !active.obstacleClass.collision.enabled) {
    return 1;
  }

  if (active.obstacleClass.terrainEffect.kind !== "speed-multiplier") {
    return 1;
  }

  return active.obstacleClass.terrainEffect.value;
}

function clampLaneForJump(lane) {
  const obstacleState = window.OceanState.obstacles;

  if (performance.now() >= obstacleState.jumpBoostUntil || obstacleState.jumpLaneStart === null) {
    return lane;
  }

  const minJumpLane = obstacleState.jumpLaneStart - obstacleState.jumpMaxColumnHop;
  const maxJumpLane = obstacleState.jumpLaneStart + obstacleState.jumpMaxColumnHop;

  return Math.max(minJumpLane, Math.min(maxJumpLane, lane));
}

function getObstacleAtPlayerRail() {
  const { OBSTACLES } = window.OceanConfig;

  if (!OBSTACLES.enabled) {
    return null;
  }

  for (let i = 0; i < OBSTACLES.placements.length; i += 1) {
    const placement = OBSTACLES.placements[i];
    const obstacleClass = getObstacleClass(placement.type);

    if (obstacleClass && playerOverlapsObstacle(placement, obstacleClass)) {
      return { placement, obstacleClass };
    }
  }

  return null;
}

function getObstacleClass(type) {
  const classes = window.OceanConfig.OBSTACLES.classes;

  for (let i = 0; i < classes.length; i += 1) {
    if (classes[i].type === type) {
      return classes[i];
    }
  }

  return null;
}

function drawObstacleMarker(placement, obstacleClass, time) {
  const ctx = window.OceanState.ctx;
  const visual = obstacleClass.visual;
  const footprint = getCellFootprintCorners(
    placement.cellCol,
    placement.cellRow,
    visual.tileSpan.cols,
    visual.tileSpan.rows,
  );

  if (!footprint) {
    return;
  }

  const center = getCellFootprintCenter(footprint);
  const pulse = (Math.sin(time * 0.006) + 1) * 0.5;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fillStyle = hexToRgba(visual.color, 0.12 + pulse * 0.08);
  ctx.strokeStyle = hexToRgba(visual.color, getMarkerStrokeAlpha(placement));
  ctx.lineWidth = getMarkerLineWidth(placement);

  drawObstacleVisual(ctx, placement, obstacleClass, footprint, center, pulse);

  ctx.restore();
}

function getCellFootprintCorners(cellCol, cellRow, cellCols, cellRows) {
  const { GRID } = window.OceanConfig;
  const vertices = window.OceanState.vertices;
  const left = Math.max(0, Math.min(GRID.cols - 2, cellCol));
  const top = Math.max(0, Math.min(GRID.rows - 2, cellRow));
  const right = Math.min(GRID.cols - 1, left + cellCols);
  const bottom = Math.min(GRID.rows - 1, top + cellRows);

  if (!vertices[top] || !vertices[bottom]) {
    return null;
  }

  return {
    backLeft: vertices[top][left],
    backRight: vertices[top][right],
    frontRight: vertices[bottom][right],
    frontLeft: vertices[bottom][left],
  };
}

function getCellFootprintCenter(footprint) {
  return {
    x: (
      footprint.backLeft.x +
      footprint.backRight.x +
      footprint.frontRight.x +
      footprint.frontLeft.x
    ) * 0.25,
    y: (
      footprint.backLeft.y +
      footprint.backRight.y +
      footprint.frontRight.y +
      footprint.frontLeft.y
    ) * 0.25,
  };
}

function drawFootprintOutline(ctx, footprint) {
  ctx.beginPath();
  ctx.moveTo(footprint.frontLeft.x, footprint.frontLeft.y);
  ctx.lineTo(footprint.frontRight.x, footprint.frontRight.y);
  ctx.lineTo(footprint.backRight.x, footprint.backRight.y);
  ctx.lineTo(footprint.backLeft.x, footprint.backLeft.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawObstacleVisual(ctx, placement, obstacleClass, footprint, center, pulse) {
  const visual = obstacleClass.visual;
  const width = Math.max(8, Math.abs(footprint.frontRight.x - footprint.frontLeft.x));
  const height = Math.max(8, Math.abs(footprint.frontLeft.y - footprint.backLeft.y));
  const size = Math.max(6, Math.min(width, height) * (0.24 + pulse * 0.04));

  if (visual.markerShape === "checkerboard") {
    drawCheckerboardCells(ctx, placement, visual);
    return;
  }

  drawFootprintOutline(ctx, footprint);

  if (visual.markerShape === "tide-band") {
    drawTideMarker(ctx, center, width, height);
  } else if (visual.markerShape === "vertical-wave") {
    drawVerticalWaveMarker(ctx, center, width, height);
  } else {
    drawCenterBoxMarker(ctx, center, size);
  }
}

function playerOverlapsObstacle(placement, obstacleClass) {
  const { GRID, PLAYER } = window.OceanConfig;
  const playerLane = Math.round(window.OceanState.player.lane);
  const railRow = Math.max(0, GRID.rows - 1 - PLAYER.railRowsFromFront);
  const railDepth = railRow / (GRID.rows - 1);
  const visual = obstacleClass.visual;
  const laneWindow = obstacleClass.timing && obstacleClass.timing.enabled
    ? obstacleClass.timing.laneWindow
    : 0.5;
  const depthWindow = getObstacleDepthWindow(obstacleClass);
  const minLane = placement.cellCol - laneWindow;
  const maxLane = placement.cellCol + visual.tileSpan.cols + laneWindow;
  const depthRange = getObstacleDepthRange(placement, obstacleClass);
  const laneMatches = playerLane >= minLane && playerLane <= maxLane;
  const depthMatches = depthIsInsideRange(railDepth, depthRange.min - depthWindow, depthRange.max + depthWindow);

  return laneMatches && depthMatches;
}

function getObstacleDepthRange(placement, obstacleClass) {
  const { GRID } = window.OceanConfig;
  const visual = obstacleClass.visual;
  const topDepth = getScrolledRowDepth(placement.cellRow, GRID.rows);
  const bottomDepth = getScrolledRowDepth(placement.cellRow + visual.tileSpan.rows, GRID.rows);

  return {
    min: Math.min(topDepth, bottomDepth),
    max: Math.max(topDepth, bottomDepth),
  };
}

function getScrolledRowDepth(row, rowCount) {
  const safeRow = Math.max(0, Math.min(rowCount - 1, row));
  const baseDepth = safeRow / rowCount;

  return wrapObstacleDepth(baseDepth + window.OceanState.world.progress);
}

function getObstacleDepthWindow(obstacleClass) {
  const { GRID } = window.OceanConfig;
  const timing = obstacleClass.timing;
  const rowWindow = timing && timing.enabled ? timing.rowWindow : 0;

  return rowWindow / Math.max(1, GRID.rows - 1);
}

function depthIsInsideRange(depth, minDepth, maxDepth) {
  const min = wrapObstacleDepth(minDepth);
  const max = wrapObstacleDepth(maxDepth);

  if (min <= max) {
    return depth >= min && depth <= max;
  }

  return depth >= min || depth <= max;
}

function wrapObstacleDepth(value) {
  return ((value % 1) + 1) % 1;
}

function getMarkerStrokeAlpha(placement) {
  const obstacleState = window.OceanState.obstacles;

  if (obstacleState.feedbackId === placement.id && performance.now() < obstacleState.feedbackUntil) {
    return 1;
  }

  if (obstacleState.activeId === placement.id) {
    return 0.96;
  }

  return 0.84;
}

function getMarkerLineWidth(placement) {
  const obstacleState = window.OceanState.obstacles;

  if (obstacleState.feedbackId === placement.id && performance.now() < obstacleState.feedbackUntil) {
    return 4;
  }

  if (obstacleState.activeId === placement.id) {
    return 3;
  }

  return 2;
}

function drawCheckerboardCells(ctx, placement, visual) {
  for (let row = 0; row < visual.tileSpan.rows; row += 1) {
    for (let col = 0; col < visual.tileSpan.cols; col += 1) {
      const cell = getCellFootprintCorners(placement.cellCol + col, placement.cellRow + row, 1, 1);

      if (!cell) {
        continue;
      }

      drawCellShape(ctx, cell, (row + col) % 2 === 0);
    }
  }
}

function drawCellShape(ctx, cell, shouldFill) {
  ctx.beginPath();
  ctx.moveTo(cell.frontLeft.x, cell.frontLeft.y);
  ctx.lineTo(cell.frontRight.x, cell.frontRight.y);
  ctx.lineTo(cell.backRight.x, cell.backRight.y);
  ctx.lineTo(cell.backLeft.x, cell.backLeft.y);
  ctx.closePath();

  if (shouldFill) {
    ctx.fill();
  }

  ctx.stroke();
}

function drawCenterBoxMarker(ctx, center, size) {
  const step = size * 0.5;

  ctx.strokeRect(center.x - step, center.y - step, size, size);
}

function drawTideMarker(ctx, center, width, height) {
  const waveWidth = Math.max(14, width * 0.62);
  const waveHeight = Math.max(6, height * 0.18);

  ctx.beginPath();
  ctx.moveTo(center.x - waveWidth * 0.5, center.y);
  ctx.quadraticCurveTo(center.x - waveWidth * 0.25, center.y - waveHeight, center.x, center.y);
  ctx.quadraticCurveTo(center.x + waveWidth * 0.25, center.y + waveHeight, center.x + waveWidth * 0.5, center.y);
  ctx.stroke();
}

function drawVerticalWaveMarker(ctx, center, width, height) {
  const markerHeight = Math.max(18, height * 0.62);
  const markerWidth = Math.max(7, width * 0.35);

  ctx.beginPath();
  ctx.moveTo(center.x, center.y + markerHeight * 0.5);
  ctx.quadraticCurveTo(center.x - markerWidth, center.y + markerHeight * 0.25, center.x, center.y);
  ctx.quadraticCurveTo(center.x + markerWidth, center.y - markerHeight * 0.25, center.x, center.y - markerHeight * 0.5);
  ctx.stroke();
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

window.OceanObstacles = {
  updateObstacles,
  drawObstacles,
  requestObstacleAction,
  clampLaneForJump,
};
