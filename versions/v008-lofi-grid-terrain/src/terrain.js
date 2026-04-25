// TERRAIN
// Readable gameplay terrain classes that affect forward ocean/world speed.

function updateTerrain(time) {
  const { TERRAIN } = window.OceanConfig;
  const state = window.OceanState;

  if (!TERRAIN.enabled) {
    state.terrain.visiblePatches = [];
    state.world.speedMultiplier = 1;
    state.world.activeTerrainType = "neutral";
    state.world.activePatchId = null;
    state.world.targetSpeed = TERRAIN.baseWorldSpeed;
    state.world.currentSpeed += (state.world.targetSpeed - state.world.currentSpeed) * TERRAIN.speedEase;
    advanceWorldProgress(time);
    return;
  }

  advanceWorldProgress(time);
  updateVisibleTerrainPatches(TERRAIN);
  updateWorldSpeedFromTerrain(TERRAIN);
}

function updateVisibleTerrainPatches(TERRAIN) {
  const state = window.OceanState;

  state.terrain.visiblePatches = TERRAIN.patches.map((patch) => ({
    ...patch,
    depthStart: wrapDepth(patch.start + state.world.progress),
    depthEnd: wrapDepth(patch.start + patch.length + state.world.progress),
    depthCenter: wrapDepth(patch.start + patch.length * 0.5 + state.world.progress),
  }));
}

function updateWorldSpeedFromTerrain(TERRAIN) {
  const state = window.OceanState;
  const playerLane = state.player.lane;
  const activePatch = findPatchAtLaneAndDepth(playerLane, TERRAIN.sampleDepth);
  let multiplier = 1;

  if (activePatch) {
    multiplier = activePatch.type === "boost" ? TERRAIN.boostMultiplier : TERRAIN.slowMultiplier;
  }

  state.world.speedMultiplier = multiplier;
  state.world.activeTerrainType = activePatch ? activePatch.type : "neutral";
  state.world.activePatchId = activePatch ? activePatch.id : null;
  state.world.targetSpeed = TERRAIN.baseWorldSpeed * multiplier;
  state.world.currentSpeed += (state.world.targetSpeed - state.world.currentSpeed) * TERRAIN.speedEase;
}

function advanceWorldProgress(time) {
  const state = window.OceanState;

  if (state.world.lastFrameTime === 0) {
    state.world.lastFrameTime = time;
    return;
  }

  const deltaTime = Math.min(time - state.world.lastFrameTime, 50);
  state.world.progress = wrapDepth(state.world.progress + deltaTime * state.world.currentSpeed);
  state.world.lastFrameTime = time;
}

function drawTerrain(time) {
  const { TERRAIN } = window.OceanConfig;

  if (!TERRAIN.drawSprites) {
    return;
  }

  const state = window.OceanState;
  const drawBand = getTerrainDrawBand();

  for (let i = 0; i < state.terrain.visiblePatches.length; i += 1) {
    const patch = state.terrain.visiblePatches[i];

    if (patch.type === "boost") {
      drawBoostPatch(patch, time, drawBand);
    } else if (patch.type === "slow") {
      drawSlowPatch(patch, time, drawBand);
    }
  }

  drawTerrainProbe();
}

function drawBoostPatch(patch, time, drawBand) {
  const ctx = window.OceanState.ctx;
  const { TERRAIN } = window.OceanConfig;
  const visibleSegments = getVisibleTerrainSegments(patch, drawBand);
  const centerLane = patch.laneCenter;
  const radius = patch.laneRadius;
  const pulse = (Math.sin(time * 0.006 + patch.seed) + 1) * 0.5;

  if (visibleSegments.length === 0) {
    return;
  }

  ctx.save();
  ctx.shadowColor = "rgba(40, 255, 180, 0.9)";
  ctx.shadowBlur = 18 + pulse * 10;
  ctx.fillStyle = "rgba(40, 255, 175, 0.16)";
  ctx.strokeStyle = "rgba(95, 255, 205, 0.9)";
  ctx.lineWidth = 2;

  for (let segmentIndex = 0; segmentIndex < visibleSegments.length; segmentIndex += 1) {
    const segment = visibleSegments[segmentIndex];
    const segmentAlpha = getTerrainDepthAlpha((segment.start + segment.end) * 0.5, drawBand);
    const leftFront = projectTerrainPoint(centerLane - radius, segment.start);
    const rightFront = projectTerrainPoint(centerLane + radius, segment.start);
    const leftBack = projectTerrainPoint(centerLane - radius * 0.48, segment.end);
    const rightBack = projectTerrainPoint(centerLane + radius * 0.48, segment.end);

    ctx.globalAlpha = segmentAlpha;
    ctx.beginPath();
    ctx.moveTo(leftFront.x, leftFront.y);
    ctx.lineTo(rightFront.x, rightFront.y);
    ctx.lineTo(rightBack.x, rightBack.y);
    ctx.lineTo(leftBack.x, leftBack.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 3; i += 1) {
      const t = (i + 1) / 4;
      const depth = segment.start + (segment.end - segment.start) * t;
      drawBoostChevron(centerLane, radius * (0.72 - i * 0.08), depth, drawBand);
    }
  }

  if (TERRAIN.edgeNoise) {
    drawPatchEdgeNoise(patch, visibleSegments, "rgba(140, 255, 220, 0.5)", drawBand);
  }

  ctx.restore();
}

function drawBoostChevron(centerLane, radius, depth, drawBand) {
  const ctx = window.OceanState.ctx;
  const left = projectTerrainPoint(centerLane - radius, clampTerrainDrawDepth(depth + 0.022, drawBand));
  const nose = projectTerrainPoint(centerLane, clampTerrainDrawDepth(depth - 0.018, drawBand));
  const right = projectTerrainPoint(centerLane + radius, clampTerrainDrawDepth(depth + 0.022, drawBand));

  ctx.strokeStyle = "rgba(225, 255, 245, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(nose.x, nose.y);
  ctx.lineTo(right.x, right.y);
  ctx.stroke();
}

function drawSlowPatch(patch, time, drawBand) {
  const ctx = window.OceanState.ctx;
  const { TERRAIN } = window.OceanConfig;
  const visibleSegments = getVisibleTerrainSegments(patch, drawBand);

  if (visibleSegments.length === 0) {
    return;
  }

  const wobble = Math.sin(time * 0.003 + patch.seed) * 0.08;
  const steps = getTerrainRenderDetail(TERRAIN.edgeNoise ? 28 : 18, TERRAIN.edgeNoise ? 20 : 14);

  ctx.save();
  ctx.shadowColor = "rgba(120, 90, 255, 0.75)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(70, 55, 180, 0.26)";
  ctx.strokeStyle = "rgba(165, 145, 255, 0.9)";
  ctx.lineWidth = 2;

  for (let segmentIndex = 0; segmentIndex < visibleSegments.length; segmentIndex += 1) {
    const segment = visibleSegments[segmentIndex];
    const centerDepth = (segment.start + segment.end) * 0.5;
    const depthRadius = Math.max(0.012, (segment.end - segment.start) * 0.5);
    const center = projectTerrainPoint(patch.laneCenter, centerDepth);
    const laneEdge = projectTerrainPoint(patch.laneCenter + patch.laneRadius, centerDepth);
    const depthEdge = projectTerrainPoint(patch.laneCenter, Math.min(segment.end, centerDepth + depthRadius));
    const radiusX = Math.max(8, Math.abs(laneEdge.x - center.x));
    const radiusY = Math.max(8, Math.abs(depthEdge.y - center.y));

    ctx.globalAlpha = getTerrainDepthAlpha(centerDepth, drawBand);
    ctx.beginPath();

    for (let i = 0; i <= steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      const noise = TERRAIN.edgeNoise ? 1 + Math.sin(angle * 5 + patch.seed) * 0.08 + wobble : 1;
      const x = center.x + Math.cos(angle) * radiusX * noise;
      const y = center.y + Math.sin(angle) * radiusY * noise;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(210, 205, 255, 0.72)";
    ctx.lineWidth = 1;
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, radiusX * (0.32 + ring * 0.2), radiusY * (0.24 + ring * 0.17), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(165, 145, 255, 0.9)";
    ctx.lineWidth = 2;
  }

  ctx.restore();
}

function drawPatchEdgeNoise(patch, visibleSegments, color, drawBand) {
  const ctx = window.OceanState.ctx;
  const steps = 9;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let segmentIndex = 0; segmentIndex < visibleSegments.length; segmentIndex += 1) {
    const segment = visibleSegments[segmentIndex];

    ctx.globalAlpha = getTerrainDepthAlpha((segment.start + segment.end) * 0.5, drawBand);
    ctx.beginPath();

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const laneOffset = Math.sin(t * Math.PI * 6 + patch.seed) * 0.35;
      const depth = segment.start + (segment.end - segment.start) * t;
      const point = projectTerrainPoint(patch.laneCenter - patch.laneRadius + laneOffset, depth);

      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    for (let i = steps; i >= 0; i -= 1) {
      const t = i / steps;
      const laneOffset = Math.cos(t * Math.PI * 5 + patch.seed) * 0.35;
      const depth = segment.start + (segment.end - segment.start) * t;
      const point = projectTerrainPoint(patch.laneCenter + patch.laneRadius + laneOffset, depth);
      ctx.lineTo(point.x, point.y);
    }

    ctx.closePath();
    ctx.stroke();
  }
}

function drawTerrainProbe() {
  const { TERRAIN, PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const left = projectTerrainPoint(PLAYER.minLane, TERRAIN.sampleDepth);
  const right = projectTerrainPoint(PLAYER.maxLane, TERRAIN.sampleDepth);
  const alpha = state.world.activeTerrainType === "neutral" ? 0.18 : 0.55;

  ctx.save();
  ctx.strokeStyle = state.world.activeTerrainType === "boost"
    ? `rgba(60, 255, 180, ${alpha})`
    : state.world.activeTerrainType === "slow"
      ? `rgba(170, 145, 255, ${alpha})`
      : `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(right.x, right.y);
  ctx.stroke();
  ctx.restore();
}

function findPatchAtLaneAndDepth(lane, depth) {
  const terrain = getTerrainAt(lane, depth);

  return terrain.patch;
}

function getTerrainAt(lane, depth) {
  const patches = window.OceanState.terrain.visiblePatches;

  for (let i = 0; i < patches.length; i += 1) {
    const patch = patches[i];
    const laneDistance = Math.abs(lane - patch.laneCenter);

    if (laneDistance <= patch.laneRadius && depthIsInsidePatch(depth, patch)) {
      return {
        type: patch.type,
        patch,
      };
    }
  }

  return {
    type: "neutral",
    patch: null,
  };
}

function getTerrainVisualAt(lane, depth) {
  const drawBand = getTerrainDrawBand();

  if (depth < drawBand.minDepth || depth > drawBand.maxDepth) {
    return {
      type: "neutral",
      alpha: 0,
    };
  }

  const terrain = getTerrainAt(lane, depth);

  if (terrain.type === "neutral") {
    return {
      type: "neutral",
      alpha: 0,
    };
  }

  return {
    type: terrain.type,
    alpha: getTerrainDepthAlpha(depth, drawBand),
  };
}

function depthIsInsidePatch(depth, patch) {
  if (patch.depthStart <= patch.depthEnd) {
    return depth >= patch.depthStart && depth <= patch.depthEnd;
  }

  return depth >= patch.depthStart || depth <= patch.depthEnd;
}

function projectTerrainPoint(lane, depth) {
  const { GRID, VIEW } = window.OceanConfig;
  const state = window.OceanState;
  const centerX = state.width * 0.5;
  const horizonY = state.height * VIEW.horizonY;
  const frontY = state.height * VIEW.frontY;
  const frontHalfWidth = state.width * VIEW.frontHalfWidth;
  const backHalfWidth = state.width * VIEW.backHalfWidth;
  const clampedLane = Math.max(0, Math.min(GRID.cols - 1, lane));
  const clampedDepth = wrapDepth(depth);
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

function getVisibleTerrainSegments(patch, drawBand) {
  const segments = [];
  const rawStart = patch.depthStart;
  let rawEnd = patch.depthEnd;

  if (rawEnd < rawStart) {
    rawEnd += 1;
  }

  addVisibleSegment(segments, rawStart, rawEnd, drawBand);

  if (rawEnd > 1) {
    addVisibleSegment(segments, 0, rawEnd - 1, drawBand);
  }

  return segments;
}

function addVisibleSegment(segments, start, end, drawBand) {
  const visibleStart = Math.max(start, drawBand.minDepth);
  const visibleEnd = Math.min(end, drawBand.maxDepth);

  if (visibleEnd - visibleStart > 0.01) {
    segments.push({
      start: visibleStart,
      end: visibleEnd,
    });
  }
}

function getTerrainDrawBand() {
  const { GRID, PLAYER, TERRAIN } = window.OceanConfig;
  const railRow = Math.max(0, GRID.rows - 1 - PLAYER.railRowsFromFront);
  const railDepth = railRow / (GRID.rows - 1);
  const rowDepth = 1 / (GRID.rows - 1);
  const fadeDistance = Math.max(rowDepth, TERRAIN.foregroundFadeRows * rowDepth);

  return {
    minDepth: TERRAIN.nearHorizonDepth,
    maxDepth: Math.max(TERRAIN.nearHorizonDepth, railDepth),
    fadeStartDepth: Math.max(TERRAIN.nearHorizonDepth, railDepth - fadeDistance),
  };
}

function getTerrainDepthAlpha(depth, drawBand) {
  if (depth <= drawBand.fadeStartDepth) {
    return 1;
  }

  if (depth >= drawBand.maxDepth) {
    return 0;
  }

  const fadeProgress = (depth - drawBand.fadeStartDepth) / (drawBand.maxDepth - drawBand.fadeStartDepth);
  return Math.max(0, Math.min(1, 1 - fadeProgress));
}

function clampTerrainDrawDepth(depth, drawBand) {
  return Math.max(drawBand.minDepth, Math.min(drawBand.maxDepth, depth));
}

function getTerrainRenderDetail(desktopSteps, mobileSteps) {
  const state = window.OceanState;
  const isSmallScreen = Math.min(state.width, state.height) < 760;

  return isSmallScreen ? mobileSteps : desktopSteps;
}

function wrapDepth(value) {
  return ((value % 1) + 1) % 1;
}

window.OceanTerrain = {
  updateTerrain,
  drawTerrain,
  getTerrainAt,
  getTerrainVisualAt,
};
