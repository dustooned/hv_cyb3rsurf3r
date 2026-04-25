// CANVAS
// Browser canvas setup, resize behavior, and background drawing.

let resizeFrame = 0;

function setupCanvas() {
  const state = window.OceanState;

  state.canvas = document.querySelector("#ocean-canvas");
  state.ctx = state.canvas.getContext("2d");

  window.addEventListener("resize", requestCanvasResize);
  resizeCanvas();
}

function requestCanvasResize() {
  if (resizeFrame !== 0) {
    return;
  }

  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    resizeCanvas();
  });
}

function resizeCanvas() {
  const state = window.OceanState;

  const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 760;
  const maxPixelRatio = isSmallScreen ? 1.35 : 2;

  state.pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
  state.width = window.innerWidth;
  state.height = window.innerHeight;

  state.canvas.width = Math.floor(state.width * state.pixelRatio);
  state.canvas.height = Math.floor(state.height * state.pixelRatio);
  state.canvas.style.width = `${state.width}px`;
  state.canvas.style.height = `${state.height}px`;

  state.ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);

  window.OceanPlayer.clampPlayerToView();
  window.OceanGrid.createGrid();
}

function drawBackground() {
  const { VIEW } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, state.width, state.height);

  // Horizon guide, intentionally visible while the camera perspective is evolving.
  ctx.strokeStyle = "rgba(80, 255, 210, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(state.width * 0.25, state.height * VIEW.horizonY);
  ctx.lineTo(state.width * 0.75, state.height * VIEW.horizonY);
  ctx.stroke();
}

window.OceanCanvas = {
  setupCanvas,
  resizeCanvas,
  drawBackground,
};
