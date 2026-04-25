// CANVAS
// Browser canvas setup, resize behavior, and background drawing.

function setupCanvas() {
  const state = window.OceanState;

  state.canvas = document.querySelector("#ocean-canvas");
  state.ctx = state.canvas.getContext("2d");

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
}

function resizeCanvas() {
  const state = window.OceanState;

  state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
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
