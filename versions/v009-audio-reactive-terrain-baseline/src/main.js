// MAIN
// Startup and frame loop only. Feature code lives in the focused modules.

function startPrototype() {
  window.OceanCanvas.setupCanvas();
  window.OceanAudio.setupAudio();
  window.OceanInput.setupInput();
  requestAnimationFrame(animate);
}

function animate(time) {
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

  requestAnimationFrame(animate);
}

startPrototype();
