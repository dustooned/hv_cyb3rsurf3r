// CONFIG
// Tuning values live here so the prototype can grow without burying numbers.

window.OceanConfig = {
  GRID: {
    cols: 30,
    rows: 18,
  },

  TERRAIN: {
    enabled: true,
    baseWorldSpeed: 0.00012,
    boostMultiplier: 1.65,
    slowMultiplier: 0.58,
    speedEase: 0.08,
    sampleDepth: 0.72,
    // Terrain art waits until about the 3rd grid row from the horizon before drawing.
    nearHorizonDepth: 0.17,
    // Fade terrain out across the last rows before the surfboard rail.
    foregroundFadeRows: 2,
    edgeNoise: true,
    patches: [
      { id: "boost-a", type: "boost", laneCenter: 9, laneRadius: 3.2, start: 0.14, length: 0.2, seed: 11 },
      { id: "slow-a", type: "slow", laneCenter: 20, laneRadius: 4.1, start: 0.33, length: 0.18, seed: 23 },
      { id: "boost-b", type: "boost", laneCenter: 17, laneRadius: 2.9, start: 0.58, length: 0.17, seed: 37 },
      { id: "slow-b", type: "slow", laneCenter: 7, laneRadius: 3.6, start: 0.78, length: 0.16, seed: 51 },
    ],
  },

  VIEW: {
    horizonY: 0.24,
    frontY: 0.9,
    backHalfWidth: 0.08,
    frontHalfWidth: 0.62,
    waveLift: 130,
  },

  DECOR: {
    rings: 15,
    spokes: 18,
    pulseSpeed: 0.0012,
    twistSpeed: 0.00045,
  },

  PLAYER: {
    startingLane: 14,
    minLane: 2,
    maxLane: 27,
    laneMoveDuration: 38,
    holdInitialDelay: 70,
    holdPulseInterval: 45,
    laneEase: "easeOut",
    allowLaneRetarget: true,
    tiltMaxDegrees: 12,
    tiltResponse: 0.35,
    tiltReturnSpeed: 0.18,
    halfWidth: 28,
    length: 86,
    bottomOffset: 46,
    railRowsFromFront: 3,
    showLaneTicks: true,
    laneDotBaseRadius: 2,
    laneDotActiveRadius: 3.4,
    laneDotPulseAmount: 2.4,
    laneDotPulseSpeed: 0.006,
    laneDotMaxRadius: 10,
  },
};
