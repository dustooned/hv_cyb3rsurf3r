// DECOR
// Blue procedural side-zone layer that sits under the central play grid.

function drawDecorativeGrid(time) {
  const { VIEW, DECOR, PERFORMANCE } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const glowScale = state.performance.glowScale;
  const centerX = state.width * 0.5;
  const horizonY = state.height * VIEW.horizonY;
  const frontY = state.height * VIEW.frontY;
  const frontHalfWidth = state.width * VIEW.frontHalfWidth;
  const backHalfWidth = state.width * VIEW.backHalfWidth;
  const centerMaskBack = backHalfWidth * 1.18;
  const centerMaskFront = frontHalfWidth * 1.04;

  ctx.save();
  clipOutsidePlayfield(centerX, horizonY, frontY, centerMaskBack, centerMaskFront);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(60, 190, 255, 0.85)";
  ctx.shadowBlur = PERFORMANCE.enableCanvasShadows ? 22 * glowScale : 0;

  const shouldReduceStrokes = PERFORMANCE.enableMobileStrokeReduction && state.performance.mobileMode;
  const ringStride = shouldReduceStrokes ? PERFORMANCE.mobileDecorRingStride : 1;
  const spokeStride = shouldReduceStrokes ? PERFORMANCE.mobileDecorSpokeStride : 1;

  for (let ring = 1; ring <= DECOR.rings; ring += ringStride) {
    const ringT = ring / DECOR.rings;
    drawDecorRing(centerX, horizonY, frontY, ringT, time, glowScale);
  }

  for (let spoke = 0; spoke < DECOR.spokes; spoke += spokeStride) {
    const sideT = spoke / (DECOR.spokes - 1);
    drawDecorSpoke(centerX, horizonY, frontY, sideT, time, glowScale);
  }

  ctx.restore();
}

function clipOutsidePlayfield(centerX, horizonY, frontY, backHalfWidth, frontHalfWidth) {
  const state = window.OceanState;
  const ctx = state.ctx;

  ctx.beginPath();
  ctx.rect(0, 0, state.width, state.height);
  ctx.moveTo(centerX - backHalfWidth, horizonY);
  ctx.lineTo(centerX + backHalfWidth, horizonY);
  ctx.lineTo(centerX + frontHalfWidth, frontY);
  ctx.lineTo(centerX - frontHalfWidth, frontY);
  ctx.closePath();
  ctx.clip("evenodd");
}

function drawDecorRing(centerX, horizonY, frontY, ringT, time, glowScale) {
  const { DECOR } = window.OceanConfig;
  const { PERFORMANCE } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const baseSteps = glowScale < 0.35 ? 32 : 64;
  const steps = PERFORMANCE.enableMobileStrokeReduction && state.performance.mobileMode
    ? Math.max(12, Math.round(baseSteps * PERFORMANCE.mobileDecorStepScale))
    : baseSteps;
  const depth = ringT * ringT;
  const y = horizonY + (frontY - horizonY) * depth;
  const maxHalfWidth = state.width * (0.92 - depth * 0.12);
  const pulse = Math.sin(time * DECOR.pulseSpeed + ringT * Math.PI * 8);
  const twist = Math.sin(time * DECOR.twistSpeed + ringT * Math.PI * 12);
  const alpha = 0.18 + ringT * 0.34;

  ctx.strokeStyle = `rgba(70, 185, 255, ${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
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

function drawDecorSpoke(centerX, horizonY, frontY, sideT, time, glowScale) {
  const { PERFORMANCE } = window.OceanConfig;
  const state = window.OceanState;
  const ctx = state.ctx;
  const baseSteps = glowScale < 0.35 ? 20 : 36;
  const steps = PERFORMANCE.enableMobileStrokeReduction && state.performance.mobileMode
    ? Math.max(8, Math.round(baseSteps * PERFORMANCE.mobileDecorStepScale))
    : baseSteps;
  const side = sideT * 2 - 1;
  const wobble = Math.sin(time * 0.001 + side * Math.PI * 4) * 0.06;

  ctx.strokeStyle = "rgba(35, 165, 255, 0.34)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const depth = t * t;
    const y = horizonY + (frontY - horizonY) * depth;
    const halfWidth = state.width * (0.18 + depth * 0.78);
    const fractalBend =
      Math.sin((t * 10 + time * 0.0015 + Math.abs(side) * 8) * Math.PI) * 26 * depth;
    const x = centerX + (side + wobble) * halfWidth + fractalBend;

    if (step === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

window.OceanDecor = {
  drawDecorativeGrid,
};
