// STATE
// Runtime data that changes while the prototype is running.

window.OceanState = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  pixelRatio: 1,
  vertices: [],

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
  },
};
