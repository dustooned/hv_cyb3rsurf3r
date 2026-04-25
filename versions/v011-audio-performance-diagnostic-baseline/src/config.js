// CONFIG
// Tuning values live here so the prototype can grow without burying numbers.

window.OceanConfig = {
  GRID: {
    cols: 20,
    rows: 13,
  },

  TERRAIN: {
    enabled: true,
    baseWorldSpeed: 0.00012,
    boostMultiplier: 1.55,
    slowMultiplier: 0.64,
    speedEase: 0.08,
    sampleDepth: 0.62,
    // Terrain art waits until about the 3rd grid row from the horizon before drawing.
    nearHorizonDepth: 0.17,
    // Fade terrain out across the last rows before the surfboard rail.
    foregroundFadeRows: 2,
    patches: [
      { id: "boost-a", type: "boost", laneCenter: 5, laneRadius: 2.8, start: 0.12, length: 0.24, seed: 11 },
      { id: "slow-a", type: "slow", laneCenter: 13, laneRadius: 3.1, start: 0.32, length: 0.22, seed: 23 },
      { id: "boost-b", type: "boost", laneCenter: 10, laneRadius: 2.6, start: 0.57, length: 0.21, seed: 37 },
      { id: "slow-b", type: "slow", laneCenter: 6, laneRadius: 2.9, start: 0.78, length: 0.2, seed: 51 },
    ],
  },

  TIMING: {
    enabled: true,
    targetLaneRadius: 0.5,
    targetDepthSize: 0.075,
    hitWindowDepth: 0.045,
    laneWindow: 0.48,
    perfectBoostMultiplier: 3.1,
    boostDuration: 1100,
    cooldownDuration: 900,
    respawnDelay: 550,
  },

  AUDIO: {
    enabled: true,
    sources: [
      "./assets/audio/test.ogg",
      "./assets/audio/test.wav",
    ],
    fftSize: 1024,
    smoothingTimeConstant: 0.68,
    gridBaseWaveAmount: 0.06,
    gridBaseRippleAmount: 0.018,
    bassWaveAmount: 0.42,
    trebleShimmerAmount: 0.12,
    volumeGlowAmount: 0.18,
    gridBassLiftAmount: 0.34,
    gridTrebleRippleAmount: 0.16,
    gridVolumeLiftAmount: 0.08,
    gridHitLiftAmount: 0.26,
    gridPulseGlowAmount: 16,
    gridPulseWidthAmount: 1.4,
    whiteThresholdShift: 0.12,
    terrainGlowAmount: 20,
    terrainWidthAmount: 2.2,
    showDebugReadout: true,
  },

  PERFORMANCE: {
    maxPixelRatioDesktop: 1,
    maxPixelRatioSmall: 1,
    targetFrameMs: 18,
    slowFrameMs: 28,
    glowRecoverRate: 0.018,
    glowDropRate: 0.08,
    minGlowScale: 0.08,
    showFrameRate: true,
  },

  VIEW: {
    horizonY: 0.24,
    frontY: 0.9,
    backHalfWidth: 0.08,
    frontHalfWidth: 0.62,
    waveLift: 130,
  },

  DECOR: {
    rings: 6,
    spokes: 7,
    pulseSpeed: 0.0012,
    twistSpeed: 0.00045,
  },

  PLAYER: {
    startingLane: 10,
    minLane: 1,
    maxLane: 18,
    laneMoveDuration: 38,
    holdInitialDelay: 70,
    holdPulseInterval: 45,
    laneEase: "easeOut",
    allowLaneRetarget: true,
    tiltMaxDegrees: 12,
    tiltResponse: 0.35,
    tiltReturnSpeed: 0.18,
    halfWidth: 20,
    length: 120,
    artReferenceLaneSpacing: 78,
    artMinScale: 0.26,
    artMaxScale: 1,
    artPhoneScaleBoost: 1.08,
    artTabletScaleBoost: 1,
    railAngleFollow: 0.78,
    railRowsFromFront: 3,
    showLaneTicks: true,
    laneDotBaseRadius: 2,
    laneDotActiveRadius: 3.4,
    laneDotPulseAmount: 2.4,
    laneDotPulseSpeed: 0.006,
    laneDotMaxRadius: 10,
  },
};
