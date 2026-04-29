// OBSTACLE GENERATOR
// Lets music suggest obstacles, then runs safety checks before placement.

function updateObstacleGenerator(time) {
  const { OBSTACLES, OBSTACLE_GENERATOR } = window.OceanConfig;
  const state = window.OceanState.obstacleGenerator;

  if (!OBSTACLES.enabled || !OBSTACLE_GENERATOR.enabled) {
    return;
  }

  pruneGeneratedObstacles(time);

  if (state.nextSpawnAt === 0) {
    state.nextSpawnAt = time + getNextSpawnDelay();
    return;
  }

  if (time < state.nextSpawnAt) {
    return;
  }

  state.nextSpawnAt = time + getNextSpawnDelay();

  if (OBSTACLE_GENERATOR.requireAudio && !window.OceanState.audio.isReady) {
    state.lastRejectedReason = "audio not ready";
    return;
  }

  if (getGeneratedObstacleCount() >= OBSTACLE_GENERATOR.maxGeneratedObstacles) {
    state.lastRejectedReason = "max generated";
    return;
  }

  if (Math.random() > getAudioSpawnChance()) {
    state.lastRejectedReason = "spawn chance";
    return;
  }

  trySpawnMusicObstacle(time);
}

function trySpawnMusicObstacle(time) {
  const { OBSTACLE_GENERATOR } = window.OceanConfig;

  for (let attempt = 0; attempt < OBSTACLE_GENERATOR.maxAttemptsPerSpawn; attempt += 1) {
    const type = chooseObstacleTypeFromAudio(time);
    const obstacleClass = getObstacleClassForGenerator(type);
    const candidate = createObstacleCandidate(type, obstacleClass, time);
    const safety = validateGeneratedObstacle(candidate, obstacleClass, time);

    if (!safety.ok) {
      window.OceanState.obstacleGenerator.lastRejectedReason = safety.reason;
      continue;
    }

    window.OceanConfig.OBSTACLES.placements.push(candidate);
    window.OceanState.obstacleGenerator.generatedCount += 1;
    window.OceanState.obstacleGenerator.lastRejectedReason = "spawned";

    if (candidate.type === "jumpwave") {
      window.OceanState.obstacleGenerator.lastJumpwaveAt = time;
    }

    return;
  }
}

function pruneGeneratedObstacles(time) {
  const { OBSTACLES, OBSTACLE_GENERATOR } = window.OceanConfig;
  const keptPlacements = [];

  for (let i = 0; i < OBSTACLES.placements.length; i += 1) {
    const placement = OBSTACLES.placements[i];

    if (!placement.generated) {
      keptPlacements.push(placement);
      continue;
    }

    if (time - placement.spawnedAt < OBSTACLE_GENERATOR.generatedLifetimeMs) {
      keptPlacements.push(placement);
    }
  }

  OBSTACLES.placements = keptPlacements;
}

function getNextSpawnDelay() {
  const { OBSTACLE_GENERATOR } = window.OceanConfig;
  const jitter = (Math.random() * 2 - 1) * OBSTACLE_GENERATOR.spawnJitterMs;

  return Math.max(180, OBSTACLE_GENERATOR.spawnIntervalMs + jitter);
}

function getAudioSpawnChance() {
  const { OBSTACLE_GENERATOR } = window.OceanConfig;
  const audio = window.OceanState.audio;
  const energy = getAudioEnergy();
  const hitEnergy = Math.max(audio.bassHit, audio.trebleHit, audio.volumeHit);
  const chance = OBSTACLE_GENERATOR.baseSpawnChance +
    energy * OBSTACLE_GENERATOR.audioInfluence +
    hitEnergy * OBSTACLE_GENERATOR.hitBonus;

  return clamp01(chance);
}

function chooseObstacleTypeFromAudio(time) {
  const { OBSTACLE_GENERATOR } = window.OceanConfig;
  const audio = window.OceanState.audio;
  const energy = getAudioEnergy();
  const quiet = 1 - energy;
  const seaweedWeight = 0.22 + quiet * OBSTACLE_GENERATOR.quietSeaweedBias;
  const tideWeight = 0.2 + Math.max(audio.treble, audio.volumeHit) * OBSTACLE_GENERATOR.trebleTideBias;
  let jumpwaveWeight = 0.1 + Math.max(audio.bassHit, audio.bass) * OBSTACLE_GENERATOR.bassJumpwaveBias;

  if (time - window.OceanState.obstacleGenerator.lastJumpwaveAt < OBSTACLE_GENERATOR.minJumpwaveGapMs) {
    jumpwaveWeight = 0;
  }

  const total = seaweedWeight + tideWeight + jumpwaveWeight;
  const roll = Math.random() * total;

  if (roll < seaweedWeight) {
    return "seaweed";
  }

  if (roll < seaweedWeight + tideWeight) {
    return "tide";
  }

  return "jumpwave";
}

function createObstacleCandidate(type, obstacleClass, time) {
  const { GRID, OBSTACLE_GENERATOR } = window.OceanConfig;
  const visual = obstacleClass.visual;
  const maxCol = Math.max(0, GRID.cols - 1 - visual.tileSpan.cols);
  const spawnRows = OBSTACLE_GENERATOR.spawnRows;
  const row = spawnRows[Math.floor(Math.random() * spawnRows.length)];

  return {
    id: `generated-${type}-${Math.round(time)}-${Math.floor(Math.random() * 1000)}`,
    type,
    cellCol: Math.floor(Math.random() * (maxCol + 1)),
    cellRow: row,
    generated: true,
    spawnedAt: time,
  };
}

function validateGeneratedObstacle(candidate, obstacleClass, time) {
  const { GRID, OBSTACLE_GENERATOR } = window.OceanConfig;
  const visual = obstacleClass.visual;

  if (candidate.cellCol < 0 || candidate.cellCol + visual.tileSpan.cols >= GRID.cols) {
    return { ok: false, reason: "column bounds" };
  }

  if (candidate.cellRow < 0 || candidate.cellRow + visual.tileSpan.rows >= GRID.rows) {
    return { ok: false, reason: "row bounds" };
  }

  if (candidate.type === "jumpwave" && time - window.OceanState.obstacleGenerator.lastJumpwaveAt < OBSTACLE_GENERATOR.minJumpwaveGapMs) {
    return { ok: false, reason: "jumpwave gap" };
  }

  for (let i = 0; i < window.OceanConfig.OBSTACLES.placements.length; i += 1) {
    const placement = window.OceanConfig.OBSTACLES.placements[i];
    const existingClass = getObstacleClassForGenerator(placement.type);

    if (!existingClass) {
      continue;
    }

    if (obstacleRectsOverlap(candidate, obstacleClass, placement, existingClass)) {
      return { ok: false, reason: "footprint overlap" };
    }

    if (obstaclesTooClose(candidate, obstacleClass, placement, existingClass)) {
      return { ok: false, reason: "spacing" };
    }

    if (candidate.type === placement.type && sameTypeTooClose(candidate, placement)) {
      return { ok: false, reason: "same type gap" };
    }
  }

  if (OBSTACLE_GENERATOR.safeLaneRequired && !hasSafeLane(candidate, obstacleClass)) {
    return { ok: false, reason: "safe lane" };
  }

  return { ok: true, reason: "ok" };
}

function obstacleRectsOverlap(first, firstClass, second, secondClass) {
  const firstRect = getObstacleRect(first, firstClass, 0);
  const secondRect = getObstacleRect(second, secondClass, 0);

  return firstRect.left < secondRect.right &&
    firstRect.right > secondRect.left &&
    firstRect.top < secondRect.bottom &&
    firstRect.bottom > secondRect.top;
}

function obstaclesTooClose(first, firstClass, second, secondClass) {
  const { OBSTACLE_GENERATOR } = window.OceanConfig;
  const firstCenter = getObstacleCenter(first, firstClass);
  const secondCenter = getObstacleCenter(second, secondClass);
  const colDistance = Math.abs(firstCenter.col - secondCenter.col);
  const rowDistance = Math.abs(firstCenter.row - secondCenter.row);

  return colDistance < OBSTACLE_GENERATOR.minColGap &&
    rowDistance < OBSTACLE_GENERATOR.minRowGap;
}

function sameTypeTooClose(first, second) {
  return Math.abs(first.cellRow - second.cellRow) < window.OceanConfig.OBSTACLE_GENERATOR.minSameTypeRowGap;
}

function hasSafeLane(candidate, obstacleClass) {
  const { GRID, OBSTACLE_GENERATOR } = window.OceanConfig;
  const blocked = new Array(GRID.cols).fill(false);
  const candidateRect = getObstacleRect(candidate, obstacleClass, OBSTACLE_GENERATOR.lanePadding);

  markBlockedLanes(blocked, candidateRect);

  for (let i = 0; i < window.OceanConfig.OBSTACLES.placements.length; i += 1) {
    const placement = window.OceanConfig.OBSTACLES.placements[i];
    const existingClass = getObstacleClassForGenerator(placement.type);

    if (!existingClass) {
      continue;
    }

    if (Math.abs(placement.cellRow - candidate.cellRow) > OBSTACLE_GENERATOR.safeLaneRowWindow) {
      continue;
    }

    markBlockedLanes(blocked, getObstacleRect(placement, existingClass, OBSTACLE_GENERATOR.lanePadding));
  }

  return countOpenLaneRuns(blocked) >= OBSTACLE_GENERATOR.safeLaneCount;
}

function markBlockedLanes(blocked, rect) {
  const left = Math.max(0, Math.floor(rect.left));
  const right = Math.min(blocked.length - 1, Math.ceil(rect.right));

  for (let col = left; col <= right; col += 1) {
    blocked[col] = true;
  }
}

function countOpenLaneRuns(blocked) {
  let longestRun = 0;
  let currentRun = 0;

  for (let i = 0; i < blocked.length; i += 1) {
    if (blocked[i]) {
      currentRun = 0;
      continue;
    }

    currentRun += 1;
    longestRun = Math.max(longestRun, currentRun);
  }

  return longestRun;
}

function getObstacleRect(placement, obstacleClass, padding) {
  return {
    left: placement.cellCol - padding,
    right: placement.cellCol + obstacleClass.visual.tileSpan.cols + padding,
    top: placement.cellRow - padding,
    bottom: placement.cellRow + obstacleClass.visual.tileSpan.rows + padding,
  };
}

function getObstacleCenter(placement, obstacleClass) {
  return {
    col: placement.cellCol + obstacleClass.visual.tileSpan.cols * 0.5,
    row: placement.cellRow + obstacleClass.visual.tileSpan.rows * 0.5,
  };
}

function getGeneratedObstacleCount() {
  let total = 0;

  for (let i = 0; i < window.OceanConfig.OBSTACLES.placements.length; i += 1) {
    if (window.OceanConfig.OBSTACLES.placements[i].generated) {
      total += 1;
    }
  }

  return total;
}

function getObstacleClassForGenerator(type) {
  const classes = window.OceanConfig.OBSTACLES.classes;

  for (let i = 0; i < classes.length; i += 1) {
    if (classes[i].type === type) {
      return classes[i];
    }
  }

  return null;
}

function getAudioEnergy() {
  const audio = window.OceanState.audio;

  return clamp01(
    audio.volume * window.OceanConfig.OBSTACLE_GENERATOR.volumeDensityBias +
    audio.bass * 0.34 +
    audio.treble * 0.28,
  );
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

window.OceanObstacleGenerator = {
  updateObstacleGenerator,
};
