// INPUT
// Keyboard state only. Gameplay movement reads this state elsewhere.

function setupInput() {
  window.addEventListener("keydown", (event) => {
    setKeyState(event, true);
  });

  window.addEventListener("keyup", (event) => {
    setKeyState(event, false);
  });
}

function setKeyState(event, isPressed) {
  const key = event.key.toLowerCase();
  const state = window.OceanState;

  if (event.key === "ArrowLeft" || key === "a") {
    state.keys.left = isPressed;
  }

  if (event.key === "ArrowRight" || key === "d") {
    state.keys.right = isPressed;
  }
}

window.OceanInput = {
  setupInput,
};
