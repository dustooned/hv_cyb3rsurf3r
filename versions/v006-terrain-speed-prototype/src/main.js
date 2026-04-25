// MAIN
// Startup and frame loop only. Feature code lives in the focused modules.

function startPrototype() {
  window.OceanCanvas.setupCanvas();
  window.OceanInput.setupInput();
  requestAnimationFrame(animate);
}

function animate(time) {
  window.OceanTerrain.updateTerrain(time);
  window.OceanWave.updateWave(time);
  window.OceanGrid.projectGrid();
  window.OceanPlayer.updatePlayer(time);
  window.OceanCanvas.drawBackground();
  window.OceanDecor.drawDecorativeGrid(time);
  window.OceanTerrain.drawTerrain(time);
  window.OceanGrid.drawGrid();
  window.OceanPlayer.drawPlayer(time);

  requestAnimationFrame(animate);
}

startPrototype();
