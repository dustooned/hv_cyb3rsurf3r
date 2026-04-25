// Input module placeholder.
// Mouse and pointer interaction can be added here without changing the grid code.

function createInputController(canvas) {
  const pointer = {
    x: 0,
    y: 0,
    isInsideCanvas: false,
  };

  canvas.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.isInsideCanvas = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.isInsideCanvas = false;
  });

  return pointer;
}

window.OceanInput = {
  createInputController,
};
