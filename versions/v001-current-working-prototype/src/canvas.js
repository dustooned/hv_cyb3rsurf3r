// Canvas helper module.
// This file owns the drawing surface so the rest of the app can stay focused.

function createCanvasView(canvas) {
  const context = canvas.getContext("2d");
  const state = {
    canvas,
    context,
    width: 0,
    height: 0,
    pixelRatio: 1,
  };

  function resize() {
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;

    canvas.width = Math.floor(state.width * state.pixelRatio);
    canvas.height = Math.floor(state.height * state.pixelRatio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;

    context.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  return state;
}

function clearCanvas(canvasView) {
  const { context, width, height } = canvasView;

  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#03070a");
  gradient.addColorStop(0.55, "#061016");
  gradient.addColorStop(1, "#020304");

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function projectGrid(canvasView, grid, settings) {
  const centerX = canvasView.width * 0.5;
  const horizonY = canvasView.height * settings.horizonRatio;
  const frontY = canvasView.height * settings.frontRatio;
  const frontHalfWidth = canvasView.width * settings.frontWidthRatio;
  const backHalfWidth = canvasView.width * settings.backWidthRatio;

  for (let row = 0; row < grid.rows; row += 1) {
    const rowProgress = row / Math.max(grid.rows - 1, 1);
    const depth = rowProgress;
    const perspective = depth * depth;
    const rowY = frontY + (horizonY - frontY) * perspective;
    const rowHalfWidth = frontHalfWidth + (backHalfWidth - frontHalfWidth) * perspective;
    const heightScale = (1 - perspective) * settings.waveLift;

    for (let col = 0; col < grid.cols; col += 1) {
      const vertex = grid.vertices[row][col];
      const colProgress = col / Math.max(grid.cols - 1, 1);
      const signedCol = colProgress * 2 - 1;
      const sidePull = signedCol * Math.abs(signedCol) * settings.sideCurve;

      vertex.depth = depth;
      vertex.screenX = centerX + signedCol * rowHalfWidth + sidePull;
      vertex.screenY = rowY - vertex.waveHeight * heightScale;
      vertex.brightness = 1 - depth * 0.72 + Math.max(0, vertex.waveHeight) * 0.35;
    }
  }
}

function drawGrid(canvasView, grid, settings) {
  const { context } = canvasView;

  projectGrid(canvasView, grid, settings);

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = "rgba(70, 210, 235, 0.4)";
  context.shadowBlur = 8;

  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      const vertex = grid.vertices[row][col];
      const right = col < grid.cols - 1 ? grid.vertices[row][col + 1] : null;
      const bottom = row < grid.rows - 1 ? grid.vertices[row + 1][col] : null;

      if (right) {
        drawVectorLine(context, vertex, right, settings);
      }

      if (bottom) {
        drawVectorLine(context, vertex, bottom, settings);
      }
    }
  }

  context.restore();
}

function drawVectorLine(context, start, end, settings) {
  const alpha = clamp((start.brightness + end.brightness) * 0.5, 0.12, 0.95);
  const lift = Math.max(start.waveHeight, end.waveHeight);
  const color = lift > 0.45 ? settings.ridgeColor : settings.lineColor;

  context.beginPath();
  context.lineWidth = lift > 0.45 ? 1.8 : 1;
  context.strokeStyle = color.replace("ALPHA", alpha.toFixed(2));
  context.moveTo(start.screenX, start.screenY);
  context.lineTo(end.screenX, end.screenY);
  context.stroke();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

window.OceanCanvas = {
  createCanvasView,
  clearCanvas,
  drawGrid,
};
