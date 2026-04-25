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
  },

  player: {
    x: window.OceanConfig.PLAYER.x,
  },
};
