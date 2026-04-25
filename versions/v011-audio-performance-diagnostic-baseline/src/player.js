// PLAYER
// Foreground surfboard marker and lane-rail movement.

function requestLaneMove(direction, time) {
  const { PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const player = state.player;

  if (player.isMovingLane) {
    if (!PLAYER.allowLaneRetarget) {
      return false;
    }

    updateLanePosition(time, PLAYER);
  }

  const nextLane = clampLane(Math.round(player.lane) + direction);

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
    updatePlayerTilt(PLAYER);
    updateHeldLanePulse(time, PLAYER);
    return;
  }

  const progress = updateLanePosition(time, PLAYER);

  if (progress >= 1) {
    player.lane = player.targetLane;
    player.fromLane = player.targetLane;
    player.isMovingLane = false;
  }

  updatePlayerTilt(PLAYER);
  updateHeldLanePulse(time, PLAYER);
}

function updateLanePosition(time, PLAYER) {
  const player = window.OceanState.player;
  const elapsed = time - player.moveStartTime;
  const progress = Math.min(elapsed / PLAYER.laneMoveDuration, 1);
  const easedProgress = easeLane(progress, PLAYER.laneEase);

  player.lane = player.fromLane + (player.targetLane - player.fromLane) * easedProgress;
  return progress;
}

function updatePlayerTilt(PLAYER) {
  const player = window.OceanState.player;
  const laneVelocity = player.lane - player.previousLane;
  const maxTilt = degreesToRadians(PLAYER.tiltMaxDegrees);
  const targetTilt = Math.max(-maxTilt, Math.min(maxTilt, laneVelocity * maxTilt * 5));
  const response = Math.abs(laneVelocity) > 0.001 ? PLAYER.tiltResponse : PLAYER.tiltReturnSpeed;

  player.tilt += (targetTilt - player.tilt) * response;
  player.previousLane = player.lane;
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

function drawPlayer(time) {
  const { PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const boardPosition = getPlayerBoardPosition();
  const artScale = getPlayerArtScale();
  const halfWidth = PLAYER.halfWidth * artScale;
  const length = PLAYER.length * artScale;
  const centerX = boardPosition.x;
  const boardCenterY = boardPosition.y;
  const boardTopY = -length * 0.54;
  const boardBottomY = length * 0.46;
  const boardMidY = 0;
  const railAngle = getPlayerRailAngle();

  if (PLAYER.showLaneTicks) {
    drawControlRail(time);
  }

  ctx.save();
  ctx.translate(centerX, boardCenterY);
  ctx.rotate(railAngle * PLAYER.railAngleFollow + state.player.tilt);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
  ctx.shadowBlur = 14;

  // Surfboard outline: a narrow vector capsule with a pointed nose.
  ctx.strokeStyle = "rgba(245, 255, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, boardTopY);
  ctx.bezierCurveTo(
    halfWidth,
    boardTopY + 15 * artScale,
    halfWidth,
    boardMidY,
    halfWidth * 0.55,
    boardBottomY,
  );
  ctx.quadraticCurveTo(0, boardBottomY + 9 * artScale, -halfWidth * 0.55, boardBottomY);
  ctx.bezierCurveTo(
    -halfWidth,
    boardMidY,
    -halfWidth,
    boardTopY + 15 * artScale,
    0,
    boardTopY,
  );
  ctx.stroke();

  // Center stripe keeps the shape readable as a board.
  ctx.strokeStyle = "rgba(80, 255, 210, 0.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, boardTopY + 12 * artScale);
  ctx.lineTo(0, boardBottomY - 7 * artScale);
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

function getPlayerArtScale() {
  const { PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const railSpacing = getControlRailSpacing();
  const shortSide = Math.min(state.width, state.height);
  const baseScale = railSpacing / PLAYER.artReferenceLaneSpacing;
  const deviceBoost = shortSide < 520
    ? PLAYER.artPhoneScaleBoost
    : shortSide < 900
      ? PLAYER.artTabletScaleBoost
      : 1;

  return Math.max(
    PLAYER.artMinScale,
    Math.min(PLAYER.artMaxScale, baseScale * deviceBoost),
  );
}

function getControlRailSpacing() {
  const centerLane = Math.round(window.OceanState.player.lane);
  const leftPoint = getControlRailPoint(Math.max(0, centerLane - 1));
  const rightPoint = getControlRailPoint(Math.min(window.OceanConfig.GRID.cols - 1, centerLane + 1));

  return Math.abs(rightPoint.x - leftPoint.x) * 0.5;
}

function getPlayerRailAngle() {
  const { GRID, PLAYER } = window.OceanConfig;
  const lane = window.OceanState.player.lane;
  const railRow = Math.max(0, GRID.rows - 1 - PLAYER.railRowsFromFront);
  const railDepth = railRow / (GRID.rows - 1);
  const boardPoint = getProjectedGridPoint(lane, railDepth);
  const backPoint = getProjectedGridPoint(lane, Math.max(0, railDepth - 0.08));
  const laneAngle = Math.atan2(boardPoint.y - backPoint.y, boardPoint.x - backPoint.x);

  return laneAngle - Math.PI * 0.5;
}

function drawControlRail(time) {
  const { PLAYER } = window.OceanConfig;
  const ctx = window.OceanState.ctx;
  const pulse = getEasedPulse(time, PLAYER.laneDotPulseSpeed);

  ctx.save();
  ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
  ctx.shadowBlur = 8;

  for (let lane = PLAYER.minLane; lane <= PLAYER.maxLane; lane += 1) {
    const point = getControlRailPoint(lane);
    const isCurrentLane = Math.round(window.OceanState.player.targetLane) === lane;
    const radius = isCurrentLane
      ? Math.min(
          PLAYER.laneDotActiveRadius + pulse * PLAYER.laneDotPulseAmount,
          PLAYER.laneDotMaxRadius,
        )
      : PLAYER.laneDotBaseRadius;

    ctx.fillStyle = isCurrentLane ? "rgba(255, 255, 255, 0.95)" : "rgba(80, 255, 210, 0.42)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function getControlRailPoint(lane) {
  const { GRID, PLAYER } = window.OceanConfig;
  const railRow = Math.max(0, GRID.rows - 1 - PLAYER.railRowsFromFront);
  const railDepth = railRow / (GRID.rows - 1);

  return getProjectedGridPoint(lane, railDepth);
}

function getProjectedGridPoint(lane, depth) {
  const { GRID, VIEW } = window.OceanConfig;
  const state = window.OceanState;
  const centerX = state.width * 0.5;
  const horizonY = state.height * VIEW.horizonY;
  const frontY = state.height * VIEW.frontY;
  const frontHalfWidth = state.width * VIEW.frontHalfWidth;
  const backHalfWidth = state.width * VIEW.backHalfWidth;
  const clampedLane = Math.max(0, Math.min(GRID.cols - 1, lane));
  const clampedDepth = Math.max(0, Math.min(1, depth));
  const colT = clampedLane / (GRID.cols - 1);
  const signedCol = colT * 2 - 1;
  const perspectiveDepth = clampedDepth * clampedDepth;
  const railY = horizonY + (frontY - horizonY) * perspectiveDepth;
  const railHalfWidth = backHalfWidth + (frontHalfWidth - backHalfWidth) * perspectiveDepth;

  return {
    x: centerX + signedCol * railHalfWidth,
    y: railY,
  };
}

function clampLane(lane) {
  const { PLAYER, GRID } = window.OceanConfig;
  const maxLane = Math.min(PLAYER.maxLane, GRID.cols - 1);
  const minLane = Math.max(PLAYER.minLane, 0);

  return Math.max(minLane, Math.min(maxLane, lane));
}

function easeLane(t, easingType) {
  if (easingType === "easeOut") {
    return 1 - Math.pow(1 - t, 3);
  }

  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getEasedPulse(time, speed) {
  const pulse = (Math.sin(time * speed) + 1) * 0.5;
  return pulse * pulse * (3 - 2 * pulse);
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

window.OceanPlayer = {
  requestLaneMove,
  updatePlayer,
  clampPlayerToView,
  drawPlayer,
};
