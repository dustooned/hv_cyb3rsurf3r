// TIMING
// Yellow lane-and-space timing target for active speed boosts.

function updateTiming(time) {
  const { TIMING } = window.OceanConfig;
  const timing = window.OceanState.timing;

  if (!TIMING.enabled) {
    timing.targetActive = false;
    return;
  }

  if (!timing.targetActive && time >= timing.nextSpawnAt && time >= timing.cooldownUntil) {
    spawnTimingTarget();
  }

  if (!timing.targetActive) {
    return;
  }

  timing.targetDepth = wrapTimingDepth(timing.targetTrackStart + window.OceanState.world.progress);

  if (timing.targetDepth > getTimingRailDepth() + TIMING.hitWindowDepth) {
    missTimingTarget(time);
  }
}

function requestTimingTap(time) {
  const { TIMING } = window.OceanConfig;
  const state = window.OceanState;
  const timing = state.timing;

  if (!TIMING.enabled || !timing.targetActive || time < timing.cooldownUntil) {
    setTimingFeedback("miss", time);
    return false;
  }

  const laneError = Math.abs(state.player.lane - timing.targetLane);
  const depthError = Math.abs(timing.targetDepth - getTimingRailDepth());
  const isLaneAligned = laneError <= TIMING.laneWindow;
  const isOnBeat = depthError <= TIMING.hitWindowDepth;

  if (!isLaneAligned || !isOnBeat) {
    setTimingFeedback("miss", time);
    return false;
  }

  timing.boostActiveUntil = time + TIMING.boostDuration;
  timing.cooldownUntil = timing.boostActiveUntil + TIMING.cooldownDuration;
  timing.targetActive = false;
  timing.nextSpawnAt = timing.cooldownUntil + TIMING.respawnDelay;
  setTimingFeedback("hit", time);
  return true;
}

function drawTiming(time) {
  const { TIMING } = window.OceanConfig;

  if (!TIMING.enabled) {
    return;
  }

  drawTimingGate(time);

  if (window.OceanState.timing.targetActive) {
    drawTimingTarget(time);
  }
}

function drawTimingGate(time) {
  const { TIMING } = window.OceanConfig;
  const state = window.OceanState;
  const timing = state.timing;
  const ctx = state.ctx;
  const railDepth = getTimingRailDepth();
  const center = projectTimingPoint(state.player.lane, railDepth);
  const laneEdge = projectTimingPoint(state.player.lane + 0.58, railDepth);
  const depthEdge = projectTimingPoint(state.player.lane, railDepth + TIMING.hitWindowDepth);
  const pulse = (Math.sin(time * 0.012) + 1) * 0.5;
  const isBoosting = isBoostActive();
  const feedbackActive = time < timing.feedbackUntil;
  const feedbackColor = timing.feedbackType === "hit"
    ? "rgba(255, 255, 180, 0.95)"
    : "rgba(255, 95, 80, 0.9)";
  const gateColor = feedbackActive
    ? feedbackColor
    : isBoosting
      ? "rgba(255, 245, 120, 0.95)"
      : "rgba(255, 220, 70, 0.78)";

  ctx.save();
  ctx.shadowColor = gateColor;
  ctx.shadowBlur = feedbackActive || isBoosting ? 22 : 12 + pulse * 8;
  ctx.strokeStyle = gateColor;
  ctx.lineWidth = feedbackActive || isBoosting ? 3 : 2;
  ctx.beginPath();
  ctx.ellipse(
    center.x,
    center.y,
    Math.max(18, Math.abs(laneEdge.x - center.x)),
    Math.max(7, Math.abs(depthEdge.y - center.y)),
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.restore();
}

function drawTimingTarget(time) {
  const { TIMING } = window.OceanConfig;
  const timing = window.OceanState.timing;
  const ctx = window.OceanState.ctx;
  const halfLane = TIMING.targetLaneRadius;
  const halfDepth = TIMING.targetDepthSize * 0.5;
  const railDepth = getTimingRailDepth();
  const depthError = Math.abs(timing.targetDepth - railDepth);
  const alignmentPulse = Math.max(0, 1 - depthError / TIMING.hitWindowDepth);
  const frontLeft = projectTimingPoint(timing.targetLane - halfLane, timing.targetDepth + halfDepth);
  const frontRight = projectTimingPoint(timing.targetLane + halfLane, timing.targetDepth + halfDepth);
  const backRight = projectTimingPoint(timing.targetLane + halfLane, timing.targetDepth - halfDepth);
  const backLeft = projectTimingPoint(timing.targetLane - halfLane, timing.targetDepth - halfDepth);
  const glow = 18 + alignmentPulse * 18 + Math.sin(time * 0.018) * 4;

  ctx.save();
  ctx.shadowColor = "rgba(255, 230, 45, 0.95)";
  ctx.shadowBlur = glow;
  ctx.fillStyle = `rgba(255, 214, 45, ${0.16 + alignmentPulse * 0.18})`;
  ctx.strokeStyle = `rgba(255, 245, 125, ${0.78 + alignmentPulse * 0.22})`;
  ctx.lineWidth = 2 + alignmentPulse * 1.4;
  ctx.beginPath();
  ctx.moveTo(frontLeft.x, frontLeft.y);
  ctx.lineTo(frontRight.x, frontRight.y);
  ctx.lineTo(backRight.x, backRight.y);
  ctx.lineTo(backLeft.x, backLeft.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function spawnTimingTarget() {
  const { PLAYER, TERRAIN } = window.OceanConfig;
  const timing = window.OceanState.timing;
  const laneCount = PLAYER.maxLane - PLAYER.minLane + 1;

  timing.targetLane = PLAYER.minLane + Math.floor(Math.random() * laneCount);
  timing.targetTrackStart = wrapTimingDepth(TERRAIN.nearHorizonDepth - window.OceanState.world.progress);
  timing.targetDepth = TERRAIN.nearHorizonDepth;
  timing.targetActive = true;
}

function missTimingTarget(time) {
  const timing = window.OceanState.timing;

  timing.targetActive = false;
  timing.nextSpawnAt = time + window.OceanConfig.TIMING.respawnDelay;
  setTimingFeedback("miss", time);
}

function setTimingFeedback(type, time) {
  const timing = window.OceanState.timing;

  timing.feedbackType = type;
  timing.feedbackUntil = time + 220;
}

function isBoostActive() {
  return performance.now() < window.OceanState.timing.boostActiveUntil;
}

function getTimingRailDepth() {
  const { GRID, PLAYER } = window.OceanConfig;
  const railRow = Math.max(0, GRID.rows - 1 - PLAYER.railRowsFromFront);

  return railRow / (GRID.rows - 1);
}

function projectTimingPoint(lane, depth) {
  const { GRID, VIEW } = window.OceanConfig;
  const state = window.OceanState;
  const centerX = state.width * 0.5;
  const horizonY = state.height * VIEW.horizonY;
  const frontY = state.height * VIEW.frontY;
  const frontHalfWidth = state.width * VIEW.frontHalfWidth;
  const backHalfWidth = state.width * VIEW.backHalfWidth;
  const clampedLane = Math.max(0, Math.min(GRID.cols - 1, lane));
  const clampedDepth = Math.max(0, Math.min(1, depth));
  const perspectiveDepth = clampedDepth * clampedDepth;
  const colT = clampedLane / (GRID.cols - 1);
  const signedCol = colT * 2 - 1;
  const y = horizonY + (frontY - horizonY) * perspectiveDepth;
  const halfWidth = backHalfWidth + (frontHalfWidth - backHalfWidth) * perspectiveDepth;

  return {
    x: centerX + signedCol * halfWidth,
    y,
  };
}

function wrapTimingDepth(value) {
  return ((value % 1) + 1) % 1;
}

window.OceanTiming = {
  updateTiming,
  drawTiming,
  requestTimingTap,
  isBoostActive,
};
