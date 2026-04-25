// PLAYER
// Foreground surfboard marker and lane-rail movement.

function requestLaneMove(direction, time) {
  const { PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const player = state.player;

  if (player.isMovingLane) {
    return false;
  }

  const nextLane = clampLane(player.targetLane + direction);

  if (nextLane === player.targetLane) {
    return false;
  }

  player.fromLane = player.lane;
  player.targetLane = nextLane;
  player.moveStartTime = time;
  player.isMovingLane = true;
  return true;
}

function updatePlayer(time) {
  const { PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const player = state.player;

  if (!player.isMovingLane) {
    player.lane = clampLane(player.targetLane);
    updateHeldLanePulse(time, PLAYER);
    return;
  }

  const elapsed = time - player.moveStartTime;
  const progress = Math.min(elapsed / PLAYER.laneMoveDuration, 1);
  const easedProgress = easeInOut(progress);

  player.lane = player.fromLane + (player.targetLane - player.fromLane) * easedProgress;

  if (progress >= 1) {
    player.lane = player.targetLane;
    player.fromLane = player.targetLane;
    player.isMovingLane = false;
  }

  updateHeldLanePulse(time, PLAYER);
}

function updateHeldLanePulse(time, PLAYER) {
  const keys = window.OceanState.keys;

  if (keys.holdDirection === 0) {
    return;
  }

  const holdAge = time - keys.holdStartedAt;
  const pulseAge = time - keys.lastPulseAt;

  if (holdAge < PLAYER.holdInitialDelay || pulseAge < PLAYER.holdPulseInterval) {
    return;
  }

  if (requestLaneMove(keys.holdDirection, time)) {
    keys.lastPulseAt = time;
  }
}

function clampPlayerToView() {
  const state = window.OceanState;
  const player = state.player;

  player.lane = clampLane(player.lane);
  player.fromLane = clampLane(player.fromLane);
  player.targetLane = clampLane(player.targetLane);
}

function drawPlayer() {
  const { PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const boardPosition = getPlayerBoardPosition();
  const centerX = boardPosition.x;
  const boardBottomY = boardPosition.y - PLAYER.bottomOffset;
  const boardTopY = boardBottomY - PLAYER.length;
  const boardMidY = boardTopY + PLAYER.length * 0.55;

  if (PLAYER.showLaneTicks) {
    drawControlRail();
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
  ctx.shadowBlur = 14;

  // Surfboard outline: a narrow vector capsule with a pointed nose.
  ctx.strokeStyle = "rgba(245, 255, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, boardTopY);
  ctx.bezierCurveTo(
    centerX + PLAYER.halfWidth,
    boardTopY + 18,
    centerX + PLAYER.halfWidth,
    boardMidY,
    centerX + PLAYER.halfWidth * 0.55,
    boardBottomY,
  );
  ctx.quadraticCurveTo(centerX, boardBottomY + 12, centerX - PLAYER.halfWidth * 0.55, boardBottomY);
  ctx.bezierCurveTo(
    centerX - PLAYER.halfWidth,
    boardMidY,
    centerX - PLAYER.halfWidth,
    boardTopY + 18,
    centerX,
    boardTopY,
  );
  ctx.stroke();

  // Center stripe keeps the shape readable as a board.
  ctx.strokeStyle = "rgba(80, 255, 210, 0.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX, boardTopY + 14);
  ctx.lineTo(centerX, boardBottomY - 8);
  ctx.stroke();

  ctx.restore();
}

function getPlayerBoardPosition() {
  const { GRID } = window.OceanConfig;
  const state = window.OceanState;
  const lane = Math.max(0, Math.min(GRID.cols - 1, state.player.lane));
  const leftLane = Math.floor(lane);
  const rightLane = Math.min(leftLane + 1, GRID.cols - 1);
  const laneBlend = lane - leftLane;
  const leftPoint = getControlRailPoint(leftLane);
  const rightPoint = getControlRailPoint(rightLane);

  return {
    x: lerp(leftPoint.x, rightPoint.x, laneBlend),
    y: lerp(leftPoint.y, rightPoint.y, laneBlend),
  };
}

function drawControlRail() {
  const { PLAYER } = window.OceanConfig;
  const ctx = window.OceanState.ctx;

  ctx.save();
  ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
  ctx.shadowBlur = 8;

  for (let lane = PLAYER.minLane; lane <= PLAYER.maxLane; lane += 1) {
    const point = getControlRailPoint(lane);
    const isCurrentLane = Math.round(window.OceanState.player.targetLane) === lane;

    ctx.fillStyle = isCurrentLane ? "rgba(255, 255, 255, 0.95)" : "rgba(80, 255, 210, 0.42)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, isCurrentLane ? 3.5 : 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function getControlRailPoint(lane) {
  const { GRID, VIEW } = window.OceanConfig;
  const state = window.OceanState;
  const centerX = state.width * 0.5;
  const colT = lane / (GRID.cols - 1);
  const signedCol = colT * 2 - 1;

  return {
    x: centerX + signedCol * state.width * VIEW.frontHalfWidth,
    y: state.height * VIEW.frontY,
  };
}

function clampLane(lane) {
  const { PLAYER, GRID } = window.OceanConfig;
  const maxLane = Math.min(PLAYER.maxLane, GRID.cols - 1);
  const minLane = Math.max(PLAYER.minLane, 0);

  return Math.max(minLane, Math.min(maxLane, lane));
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

window.OceanPlayer = {
  requestLaneMove,
  updatePlayer,
  clampPlayerToView,
  drawPlayer,
};
