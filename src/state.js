// STATE
// Runtime data that changes while the prototype is running.

window.OceanState = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  pixelRatio: 1,
  vertices: [],

  world: {
    progress: 0,
    currentSpeed: window.OceanConfig.TERRAIN.baseWorldSpeed,
    targetSpeed: window.OceanConfig.TERRAIN.baseWorldSpeed,
    speedMultiplier: 1,
    activeTerrainType: "neutral",
    activePatchId: null,
    lastFrameTime: 0,
  },

  terrain: {
    visiblePatches: [],
  },

  performance: {
    lastFrameTime: 0,
    frameMs: 16.7,
    fps: 60,
    glowScale: 1,
    isSmallScreen: false,
    mobileMode: false,
    renderMode: "full",
  },

  timing: {
    targetLane: window.OceanConfig.PLAYER.startingLane,
    targetDepth: 0,
    targetTrackStart: 0,
    targetActive: false,
    nextSpawnAt: 0,
    boostActiveUntil: 0,
    cooldownUntil: 0,
    feedbackType: "neutral",
    feedbackUntil: 0,
  },

  audio: {
    element: null,
    context: null,
    source: null,
    analyser: null,
    frequencyData: null,
    hasStarted: false,
    isStarting: false,
    isReady: false,
    isMissing: false,
    hasError: false,
    status: "waiting",
    sourceStatus: "no source tried",
    currentSource: "",
    currentSourceType: "",
    sourceIndex: -1,
    sourceCandidates: [],
    sourceMode: "desktop",
    startAttemptId: 0,
    hasTriedAutoStart: false,
    lastPlaybackTime: 0,
    bass: 0,
    treble: 0,
    volume: 0,
    bassHit: 0,
    trebleHit: 0,
    volumeHit: 0,
  },

  keys: {
    left: false,
    right: false,
    holdDirection: 0,
    holdStartedAt: 0,
    lastPulseAt: 0,
  },

  player: {
    lane: window.OceanConfig.PLAYER.startingLane,
    fromLane: window.OceanConfig.PLAYER.startingLane,
    targetLane: window.OceanConfig.PLAYER.startingLane,
    moveStartTime: 0,
    isMovingLane: false,
    previousLane: window.OceanConfig.PLAYER.startingLane,
    tilt: 0,
  },
};
