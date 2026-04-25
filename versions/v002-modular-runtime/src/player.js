// PLAYER
// Foreground surfboard marker and left/right movement.

function updatePlayer() {
  const { PLAYER } = window.OceanConfig;
  const state = window.OceanState;

  if (state.keys.left) {
    state.player.x -= PLAYER.speed;
  }

  if (state.keys.right) {
    state.player.x += PLAYER.speed;
  }

  clampPlayerToView();
}

function clampPlayerToView() {
  const { VIEW, PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const playfieldHalfWidth = state.width * VIEW.frontHalfWidth - PLAYER.halfWidth;

  state.player.x = Math.max(-playfieldHalfWidth, Math.min(playfieldHalfWidth, state.player.x));
}

function drawPlayer() {
  const { VIEW, PLAYER } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const centerX = state.width * 0.5 + state.player.x;
  const boardBottomY = state.height * VIEW.frontY - PLAYER.bottomOffset;
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

window.OceanPlayer = {
  updatePlayer,
  clampPlayerToView,
  drawPlayer,
};
