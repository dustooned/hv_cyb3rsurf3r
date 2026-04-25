// Ocean Grid Prototype
// One-file runtime for now: fewer moving parts, easier debugging.

const canvas = document.querySelector("#ocean-canvas");
const ctx = canvas.getContext("2d");

// Grid shape: this stays close to the original 30 x 18 requirement.
const GRID = {
  cols: 30,
  rows: 18,
  scrollSpeed: 0.00018,
};

// Tempest-like camera shape.
const VIEW = {
  horizonY: 0.24,
  frontY: 0.9,
  backHalfWidth: 0.08,
  frontHalfWidth: 0.62,
  waveLift: 130,
};

// Decorative zone layer.
// This sits under the main grid and is clipped away from the center lane.
const DECOR = {
  rings: 15,
  spokes: 18,
  pulseSpeed: 0.0012,
  twistSpeed: 0.00045,
};

// Foreground player marker.
// This is intentionally simple: left/right movement only.
const PLAYER = {
  x: 0,
  speed: 8,
  halfWidth: 28,
  length: 86,
  bottomOffset: 46,
};

let width = 0;
let height = 0;
let pixelRatio = 1;
let vertices = [];
const keys = {
  left: false,
  right: false,
};

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  clampPlayerToView();
  createGrid();
}

function createGrid() {
  vertices = [];

  for (let row = 0; row < GRID.rows; row += 1) {
    const rowVertices = [];

    for (let col = 0; col < GRID.cols; col += 1) {
      rowVertices.push({
        baseX: col,
        baseY: row,
        x: 0,
        y: 0,
        row,
        col,
        depth: 0,
        waveHeight: 0,
      });
    }

    vertices.push(rowVertices);
  }
}

function updateWave(time) {
  const scroll = time * GRID.scrollSpeed;
  const waveTravel = time * 0.0014;

  for (let row = 0; row < GRID.rows; row += 1) {
    // Moving depth makes rows appear from the horizon and travel toward the viewer.
    const baseDepth = row / GRID.rows;
    const depth = (baseDepth + scroll) % 1;

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = vertices[row][col];
      const colT = col / (GRID.cols - 1);
      const signedCol = colT * 2 - 1;

      // Left mask keeps the raised geometry on the left side.
      const leftMask = Math.exp(-Math.pow((signedCol + 0.65) / 0.32, 2));

      // Repeating ridge: depth makes the wave travel through the scrolling grid.
      const ridge = Math.max(0, Math.sin((depth * 2.4 + waveTravel) * Math.PI * 2));
      const smallMotion = Math.sin((depth * 9 + signedCol * 4 + waveTravel * 2) * Math.PI) * 0.25;

      vertex.depth = depth;
      vertex.waveHeight = (ridge + smallMotion) * leftMask;
    }
  }
}

function projectGrid() {
  const centerX = width * 0.5;
  const horizonY = height * VIEW.horizonY;
  const frontY = height * VIEW.frontY;
  const frontHalfWidth = width * VIEW.frontHalfWidth;
  const backHalfWidth = width * VIEW.backHalfWidth;

  for (let row = 0; row < GRID.rows; row += 1) {
    const rowDepth = vertices[row][0].depth;
    const depth = rowDepth * rowDepth;
    const screenY = horizonY + (frontY - horizonY) * depth;
    const halfWidth = backHalfWidth + (frontHalfWidth - backHalfWidth) * depth;
    const lift = depth * VIEW.waveLift;

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = vertices[row][col];
      const colT = col / (GRID.cols - 1);
      const signedCol = colT * 2 - 1;

      vertex.x = centerX + signedCol * halfWidth;
      vertex.y = screenY - vertex.waveHeight * lift;
    }
  }
}

function drawBackground() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Horizon guide, intentionally visible for debugging the camera.
  ctx.strokeStyle = "rgba(80, 255, 210, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width * 0.25, height * VIEW.horizonY);
  ctx.lineTo(width * 0.75, height * VIEW.horizonY);
  ctx.stroke();
}

function drawDecorativeGrid(time) {
  const centerX = width * 0.5;
  const horizonY = height * VIEW.horizonY;
  const frontY = height * VIEW.frontY;
  const frontHalfWidth = width * VIEW.frontHalfWidth;
  const backHalfWidth = width * VIEW.backHalfWidth;
  const centerMaskBack = backHalfWidth * 1.18;
  const centerMaskFront = frontHalfWidth * 1.04;

  ctx.save();
  clipOutsidePlayfield(centerX, horizonY, frontY, centerMaskBack, centerMaskFront);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(60, 190, 255, 0.85)";
  ctx.shadowBlur = 22;

  for (let ring = 1; ring <= DECOR.rings; ring += 1) {
    const ringT = ring / DECOR.rings;
    drawDecorRing(centerX, horizonY, frontY, ringT, time);
  }

  for (let spoke = 0; spoke < DECOR.spokes; spoke += 1) {
    const sideT = spoke / (DECOR.spokes - 1);
    drawDecorSpoke(centerX, horizonY, frontY, sideT, time);
  }

  ctx.restore();
}

function clipOutsidePlayfield(centerX, horizonY, frontY, backHalfWidth, frontHalfWidth) {
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.moveTo(centerX - backHalfWidth, horizonY);
  ctx.lineTo(centerX + backHalfWidth, horizonY);
  ctx.lineTo(centerX + frontHalfWidth, frontY);
  ctx.lineTo(centerX - frontHalfWidth, frontY);
  ctx.closePath();
  ctx.clip("evenodd");
}

function drawDecorRing(centerX, horizonY, frontY, ringT, time) {
  const depth = ringT * ringT;
  const y = horizonY + (frontY - horizonY) * depth;
  const maxHalfWidth = width * (0.92 - depth * 0.12);
  const pulse = Math.sin(time * DECOR.pulseSpeed + ringT * Math.PI * 8);
  const twist = Math.sin(time * DECOR.twistSpeed + ringT * Math.PI * 12);
  const alpha = 0.18 + ringT * 0.34;

  ctx.strokeStyle = `rgba(70, 185, 255, ${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let step = 0; step <= 96; step += 1) {
    const t = step / 96;
    const side = t * 2 - 1;
    const mirrorWave = Math.sin(Math.abs(side) * Math.PI * 5 + time * 0.0018 + ringT * 7);
    const x = centerX + side * maxHalfWidth;
    const yOffset = (pulse * 12 + mirrorWave * 18 + twist * side * 20) * depth;

    if (step === 0) {
      ctx.moveTo(x, y + yOffset);
    } else {
      ctx.lineTo(x, y + yOffset);
    }
  }

  ctx.stroke();
}

function drawDecorSpoke(centerX, horizonY, frontY, sideT, time) {
  const side = sideT * 2 - 1;
  const wobble = Math.sin(time * 0.001 + side * Math.PI * 4) * 0.06;

  ctx.strokeStyle = "rgba(35, 165, 255, 0.34)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let step = 0; step <= 48; step += 1) {
    const t = step / 48;
    const depth = t * t;
    const y = horizonY + (frontY - horizonY) * depth;
    const halfWidth = width * (0.18 + depth * 0.78);
    const fractalBend = Math.sin((t * 10 + time * 0.0015 + Math.abs(side) * 8) * Math.PI) * 26 * depth;
    const x = centerX + (side + wobble) * halfWidth + fractalBend;

    if (step === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

function drawGrid() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(60, 255, 220, 0.7)";
  ctx.shadowBlur = 8;

  const rowsByDepth = [...vertices].sort((a, b) => a[0].depth - b[0].depth);

  for (let row = 0; row < rowsByDepth.length; row += 1) {
    const rowVertices = rowsByDepth[row];

    for (let col = 0; col < GRID.cols; col += 1) {
      const vertex = rowVertices[col];

      if (col < GRID.cols - 1) {
        drawLine(vertex, rowVertices[col + 1]);
      }

      if (row < rowsByDepth.length - 1) {
        drawLine(vertex, rowsByDepth[row + 1][col]);
      }
    }
  }
}

function drawLine(a, b) {
  const wave = Math.max(a.waveHeight, b.waveHeight);
  const alpha = Math.max(0.35, Math.min(1, 0.55 + wave * 0.7));

  ctx.strokeStyle = wave > 0.45
    ? `rgba(240, 255, 255, ${alpha})`
    : `rgba(70, 255, 210, ${alpha})`;
  ctx.lineWidth = wave > 0.45 ? 2 : 1;

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function updatePlayer() {
  if (keys.left) {
    PLAYER.x -= PLAYER.speed;
  }

  if (keys.right) {
    PLAYER.x += PLAYER.speed;
  }

  clampPlayerToView();
}

function clampPlayerToView() {
  const playfieldHalfWidth = width * VIEW.frontHalfWidth - PLAYER.halfWidth;
  PLAYER.x = Math.max(-playfieldHalfWidth, Math.min(playfieldHalfWidth, PLAYER.x));
}

function drawPlayer() {
  const centerX = width * 0.5 + PLAYER.x;
  const boardBottomY = height * VIEW.frontY - PLAYER.bottomOffset;
  const boardTopY = boardBottomY - PLAYER.length;
  const boardMidY = boardTopY + PLAYER.length * 0.55;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
  ctx.shadowBlur = 14;

  // Surfboard outline: a narrow vector capsule with a pointed nose.
  ctx.strokeStyle = "rgba(245, 255, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, boardTopY);
  ctx.bezierCurveTo(
    centerX + PLAYER.halfWidth,
    boardTopY + 18,
    centerX + PLAYER.halfWidth,
    boardMidY,
    centerX + PLAYER.halfWidth * 0.55,
    boardBottomY,
  );
  ctx.quadraticCurveTo(centerX, boardBottomY + 12, centerX - PLAYER.halfWidth * 0.55, boardBottomY);
  ctx.bezierCurveTo(
    centerX - PLAYER.halfWidth,
    boardMidY,
    centerX - PLAYER.halfWidth,
    boardTopY + 18,
    centerX,
    boardTopY,
  );
  ctx.stroke();

  // Center stripe keeps the shape readable as a board.
  ctx.strokeStyle = "rgba(80, 255, 210, 0.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX, boardTopY + 14);
  ctx.lineTo(centerX, boardBottomY - 8);
  ctx.stroke();

  ctx.restore();
}

function animate(time) {
  updatePlayer();
  updateWave(time);
  projectGrid();
  drawBackground();
  drawDecorativeGrid(time);
  drawGrid();
  drawPlayer();

  requestAnimationFrame(animate);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(animate);
