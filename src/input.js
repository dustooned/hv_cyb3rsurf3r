// INPUT
// Keyboard state only. Gameplay movement reads this state elsewhere.

function setupInput() {
  window.addEventListener("keydown", (event) => {
    handleKeyDown(event);
  });

  window.addEventListener("keyup", (event) => {
    setKeyState(event, false);
  });

  window.addEventListener("pointerdown", requestAudioStartFromGesture, { capture: true });
  window.addEventListener("mousedown", requestAudioStartFromGesture, { capture: true });
  window.addEventListener("click", requestAudioStartFromGesture, { capture: true });
  window.addEventListener("touchstart", requestAudioStartFromGesture, { capture: true });
}

function requestAudioStartFromGesture() {
  window.OceanAudio.startAudio();
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();

  window.OceanAudio.startAudio();

  if (event.key === "ArrowLeft" || key === "a") {
    event.preventDefault();
    setKeyState(event, true, -1);
  }

  if (event.key === "ArrowRight" || key === "d") {
    event.preventDefault();
    setKeyState(event, true, 1);
  }

  if (event.code === "Space") {
    event.preventDefault();

    if (!event.repeat) {
      const now = performance.now();
      const obstacleHandled = window.OceanObstacles.requestObstacleAction(now);

      if (!obstacleHandled) {
        window.OceanTiming.requestTimingTap(now);
      }
    }
  }
}

function setKeyState(event, isPressed, direction = 0) {
  const key = event.key.toLowerCase();
  const state = window.OceanState;
  const isLeft = event.key === "ArrowLeft" || key === "a";
  const isRight = event.key === "ArrowRight" || key === "d";

  if (!isLeft && !isRight) {
    return;
  }

  if (isPressed && event.repeat) {
    return;
  }

  if (isLeft) {
    state.keys.left = isPressed;
  }

  if (isRight) {
    state.keys.right = isPressed;
  }

  if (isPressed) {
    const now = performance.now();

    state.keys.holdDirection = direction;
    state.keys.holdStartedAt = now;
    state.keys.lastPulseAt = now;
    window.OceanPlayer.requestLaneMove(direction, now);
    return;
  }

  if (
    (state.keys.holdDirection === -1 && !state.keys.left) ||
    (state.keys.holdDirection === 1 && !state.keys.right)
  ) {
    const now = performance.now();

    state.keys.holdDirection = state.keys.right ? 1 : state.keys.left ? -1 : 0;
    state.keys.holdStartedAt = now;
    state.keys.lastPulseAt = now;
  }
}

window.OceanInput = {
  setupInput,
};
