// MAIN
// Startup and frame loop only. Feature code lives in the focused modules.

function startPrototype() {
  window.OceanCanvas.setupCanvas();
  window.OceanInput.setupInput();
  requestAnimationFrame(animate);
}

function animate(time) {
  window.OceanPlayer.updatePlayer();
  window.OceanWave.updateWave(time);
  window.OceanGrid.projectGrid();
  window.OceanCanvas.drawBackground();
  window.OceanDecor.drawDecorativeGrid(time);
  window.OceanGrid.drawGrid();
  window.OceanPlayer.drawPlayer();

  requestAnimationFrame(animate);
}

startPrototype();
