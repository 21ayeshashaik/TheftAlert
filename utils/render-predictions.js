import { throttle } from "lodash";

export const renderPredictions = (predictions, ctx, target = "person", volume = true) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Fonts
  const font = "18px Inter";
  ctx.font = font;
  ctx.textBaseline = "top";

  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction["bbox"];

    const isTarget = prediction.class.toLowerCase() === target.toLowerCase();

    // specific styling for target vs others
    const strokeColor = isTarget ? "#EF4444" : "#3B82F6"; // Red for target, Blue for others
    const fillColor = isTarget ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.1)";

    // bounding box
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 10;
    ctx.strokeRect(x, y, width, height);

    // fill the color
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    // Draw the label background.
    ctx.fillStyle = strokeColor;
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10); // base 10
    ctx.fillRect(x, y, textWidth + 8, textHeight + 8);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(prediction.class, x + 4, y + 4);

    if (isTarget && volume) {
      playAudio();
    }
  });
};

const playAudio = throttle(() => {
  const audio = new Audio("/pols-aagyi-pols.mp3");
  audio.play().catch(e => console.log("Audio play failed:", e));
}, 2000);
