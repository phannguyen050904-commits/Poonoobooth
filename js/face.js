import { getVideo } from "./camera.js";

export async function initFace() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");

  console.log("FaceAPI loaded");

  startDetect();
}

async function startDetect() {
  const video = getVideo();
  const canvas = document.getElementById("overlay");

  const size = {
    width: video.videoWidth,
    height: video.videoHeight
  };

  faceapi.matchDimensions(canvas, size);

  setInterval(async () => {
    if (!video.videoWidth) return;

    const detections =
      await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

    const resized = faceapi.resizeResults(detections, size);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resized);
  }, 100);
}
