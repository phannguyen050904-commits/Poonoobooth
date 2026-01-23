import { elements } from './dom.js';
import { safeErr } from './utils.js';

// Start camera
export async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    elements.video.srcObject = stream;
  } catch (err) {
    safeErr('Cannot access camera:', err);
  }
}

// Handle resize
export function handleResize() {
  if (elements.video.videoWidth > 0 && elements.video.videoHeight > 0) {
    elements.overlay.width = elements.video.videoWidth;
    elements.overlay.height = elements.video.videoHeight;
    if (typeof faceapi !== 'undefined' && window.faceModelsLoaded) {
      const displaySize = { width: elements.video.videoWidth, height: elements.video.videoHeight };
      faceapi.matchDimensions(elements.overlay, displaySize);
    }
  }
}