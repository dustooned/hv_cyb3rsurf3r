// CONFIG
// Tuning values live here so the prototype can grow without burying numbers.

window.OceanConfig = {
  GRID: {
    cols: 30,
    rows: 18,
    scrollSpeed: 0.00018,
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
    halfWidth: 28,
    length: 86,
    bottomOffset: 46,
    showLaneTicks: true,
  },
};
