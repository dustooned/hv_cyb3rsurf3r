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
  }));
}

function updateWorldSpeedFromTerrain(TERRAIN) {
  const state = window.OceanState;
  const terrain = getTerrainAt(state.player.lane, TERRAIN.sampleDepth);
  const activePatch = terrain.patch;
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

function wrapDepth(value) {
  return ((value % 1) + 1) % 1;
}

window.OceanTerrain = {
  updateTerrain,
  getTerrainAt,
  getTerrainVisualAt,
};
