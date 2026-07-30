const drawCoverVideo = (
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  mirrored: boolean,
) => {
  const videoRatio = video.videoWidth / video.videoHeight;
  const containerRatio = width / height;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (videoRatio > containerRatio) {
    sourceWidth = video.videoHeight * containerRatio;
    sourceX = (video.videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = video.videoWidth / containerRatio;
    sourceY = (video.videoHeight - sourceHeight) / 2;
  }

  context.save();
  if (mirrored) {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
  context.restore();
};

const drawOverlay = (
  context: CanvasRenderingContext2D,
  layer: HTMLElement,
) => {
  const source = layer instanceof HTMLImageElement
    ? layer
    : layer.querySelector("canvas, img");
  if (!(source instanceof HTMLCanvasElement || source instanceof HTMLImageElement)) return;

  const x = Number.parseFloat(layer.style.left);
  const y = Number.parseFloat(layer.style.top);
  const rotation = Number.parseFloat(layer.dataset.arRotation ?? "0");
  const width = layer.offsetWidth;
  const height = layer.offsetHeight;
  if (![x, y, rotation, width, height].every(Number.isFinite)) return;

  context.save();
  context.translate(x, y);
  context.rotate(rotation * Math.PI / 180);
  context.drawImage(source, -width / 2, -height / 2, width, height);
  context.restore();
};

export const captureTryOn = (
  container: HTMLElement,
  video: HTMLVideoElement,
  mirrored: boolean,
): Promise<Blob> => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas is unavailable."));

  context.scale(scale, scale);
  drawCoverVideo(context, video, width, height, mirrored);
  container.querySelectorAll<HTMLElement>("[data-ar-layer]").forEach((layer) => {
    drawOverlay(context, layer);
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Image encoding failed.")),
      "image/png",
    );
  });
};
