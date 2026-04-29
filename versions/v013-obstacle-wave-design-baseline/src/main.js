// MAIN
// Startup and frame loop only. Feature code lives in the focused modules.

function startPrototype() {
  window.OceanCanvas.setupCanvas();
  window.OceanAudio.setupAudio();
  window.OceanInput.setupInput();
  requestAnimationFrame(animate);
}

function animate(time) {
  updatePerformance(time);
  window.OceanAudio.updateAudio();
  window.OceanTiming.updateTiming(time);
  window.OceanTerrain.updateTerrain(time);
  window.OceanWave.updateWave(time);
  window.OceanGrid.projectGrid();
  window.OceanPlayer.updatePlayer(time);
  window.OceanCanvas.drawBackground();
  window.OceanDecor.drawDecorativeGrid(time);
  window.OceanGrid.drawGrid();
  window.OceanTiming.drawTiming(time);
  window.OceanPlayer.drawPlayer(time);
  window.OceanAudio.drawAudioDebug();

  requestAnimationFrame(animate);
}

function updatePerformance(time) {
  const { PERFORMANCE } = window.OceanConfig;
  const perf = window.OceanState.performance;

  if (perf.lastFrameTime === 0) {
    perf.lastFrameTime = time;
    return;
  }

  const frameMs = Math.max(1, time - perf.lastFrameTime);
  perf.lastFrameTime = time;
  perf.frameMs += (frameMs - perf.frameMs) * 0.08;
  perf.fps = 1000 / perf.frameMs;
  updateRenderMode(perf, PERFORMANCE);

  if (perf.frameMs > PERFORMANCE.slowFrameMs) {
    perf.glowScale = Math.max(
      PERFORMANCE.minGlowScale,
      perf.glowScale - PERFORMANCE.glowDropRate,
    );
    return;
  }

  if (perf.frameMs < PERFORMANCE.targetFrameMs) {
    perf.glowScale = Math.min(1, perf.glowScale + PERFORMANCE.glowRecoverRate);
  }
}

function updateRenderMode(perf, PERFORMANCE) {
  if (perf.isSmallScreen || perf.frameMs > PERFORMANCE.mobileModeFrameMs) {
    perf.mobileMode = true;
  } else if (perf.frameMs < PERFORMANCE.fullModeRecoverFrameMs) {
    perf.mobileMode = false;
  }

  perf.renderMode = PERFORMANCE.enableMobileStrokeReduction && perf.mobileMode
    ? "mobile"
    : "vector";
}

startPrototype();
