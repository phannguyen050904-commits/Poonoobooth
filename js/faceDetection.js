// faceDetection.js - Complete with marks integration
import { state, assets } from './state.js';
import { elements, overlayCtx } from './dom.js';
import { safeLog, safeErr } from './utils.js';
import { drawGrainOverlay, drawTimestampOnVideo } from './effects.js';
import { drawMarksOnOverlay } from './marks.js';

// Load face detection models
export async function loadFaceModels() {
  if (state.faceModelsLoaded) return true;
  if (typeof faceapi === 'undefined') {
    safeErr('face-api not present');
    return false;
  }

  try {
    safeLog('Loading face models from /models ...');
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    state.faceModelsLoaded = true;
    safeLog('Face models loaded (local)');
    return true;
  } catch (err) {
    safeErr('Local models failed, trying CDN:', err);
    try {
      const base = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      await faceapi.nets.tinyFaceDetector.loadFromUri(base);
      await faceapi.nets.faceLandmark68Net.loadFromUri(base);
      await faceapi.nets.faceRecognitionNet.loadFromUri(base);
      await faceapi.nets.faceExpressionNet.loadFromUri(base);
      state.faceModelsLoaded = true;
      safeLog('Face models loaded (CDN)');
      return true;
    } catch (cdnErr) {
      safeErr('Failed to load face models:', cdnErr);
      return false;
    }
  }
}

// Draw dialogue on face
export function drawDialogueOnFace(detection) {
  if (!state.showDialogue || state.selectedDialogue === 'none' || !state.dialogueText.trim()) return;

  const currentDialogue = assets.dialogueImages[state.selectedDialogue];
  if (!currentDialogue || !currentDialogue.complete) return;

  const landmarks = detection.landmarks;
  const nose = landmarks.getNose();
  
  const faceWidth = Math.abs(landmarks.getRightEye()[3].x - landmarks.getLeftEye()[0].x);
  const baseDialogueWidth = faceWidth * 1.5;
  const originalAspectRatio = currentDialogue.naturalWidth / currentDialogue.naturalHeight;
  const baseDialogueHeight = baseDialogueWidth / originalAspectRatio;

  const dialogueWidth = baseDialogueWidth * state.dialogueScale;
  const dialogueHeight = baseDialogueHeight * state.dialogueScale;

  let centerX, centerY;
  const baseOffsetX = baseDialogueWidth * 0.3;
  const baseOffsetY = baseDialogueHeight * 0.3;

  switch (state.dialoguePosition) {
    case 'top-left':
      centerX = nose[0].x + baseOffsetX * 4;
      centerY = nose[0].y - baseOffsetY * 3;
      break;
    case 'top-right':
      centerX = nose[0].x - baseOffsetX * 4;
      centerY = nose[0].y - baseOffsetY * 3;
      break;
    default:
      centerX = nose[0].x + baseOffsetX * 3;
      centerY = nose[0].y - baseOffsetY * 1.5;
  }

  overlayCtx.drawImage(
    currentDialogue,
    centerX - dialogueWidth / 2,
    centerY - dialogueHeight / 2,
    dialogueWidth,
    dialogueHeight
  );

  overlayCtx.save();
  overlayCtx.translate(elements.overlay.width, 0);
  overlayCtx.scale(-1, 1);

  const flippedCenterX = elements.overlay.width - centerX;
  
  overlayCtx.font = `${state.dialogueSize}px ${state.dialogueFont}`;
  overlayCtx.fillStyle = state.dialogueColor;
  overlayCtx.textAlign = 'center';
  overlayCtx.textBaseline = 'middle';
  
  const maxWidth = dialogueWidth * 0.8;
  const words = state.dialogueText.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = overlayCtx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  const lineHeight = state.dialogueSize * 1.2;
  const startY = centerY - (lines.length - 1) * lineHeight / 2;
  
  lines.forEach((line, index) => {
    overlayCtx.fillText(
      line,
      flippedCenterX,
      startY + index * lineHeight
    );
  });

  overlayCtx.restore();
}

// Detect faces live
export async function detectFacesLive() {
  // Nếu không có filter, dialogue hoặc marks thì chỉ vẽ grain và timestamp
  if (state.selectedFilter === 'none' && 
      (!state.showDialogue || state.selectedDialogue === 'none' || !state.dialogueText.trim())) {
    overlayCtx.clearRect(0, 0, elements.overlay.width, elements.overlay.height);
    drawGrainOverlay();
    drawMarksOnOverlay(); // Vẽ marks
    drawTimestampOnVideo();
    state.animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  if (state.detectionInProgress) {
    state.animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  state.detectionInProgress = true;

  // Cập nhật kích thước overlay nếu cần
  if (elements.overlay.width !== elements.video.videoWidth || 
      elements.overlay.height !== elements.video.videoHeight) {
    elements.overlay.width = elements.video.videoWidth;
    elements.overlay.height = elements.video.videoHeight;
  }

  try {
    const detections = await faceapi
      .detectAllFaces(elements.video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    overlayCtx.clearRect(0, 0, elements.overlay.width, elements.overlay.height);
    drawGrainOverlay();
    drawMarksOnOverlay(); // Vẽ marks trước filter và dialogue

    if (detections && detections.length > 0) {
      if (state.selectedFilter !== 'none') {
        const currentFilter = assets.filterImages[state.selectedFilter];
        if (currentFilter && currentFilter.image.complete) {
          detections.forEach(d => {
            const landmarks = d.landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const nose = landmarks.getNose();

            const baseFaceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
            const faceWidth = baseFaceWidth * (currentFilter.scale || 1.0);
            const originalAspectRatio = currentFilter.image.naturalWidth / currentFilter.image.naturalHeight;
            const faceHeight = faceWidth / originalAspectRatio;

            const centerX = (leftEye[3].x + rightEye[0].x) / 2 - faceWidth * (currentFilter.offsetX || 0) + 
                          (state.filterOffsetX * faceWidth);
            const centerY = nose[0].y - faceHeight * (currentFilter.offsetY || 0) + 
                          (state.filterOffsetY * faceHeight);

            overlayCtx.drawImage(
              currentFilter.image,
              centerX - faceWidth / 2,
              centerY - faceHeight / 2,
              faceWidth,
              faceHeight
            );
          });
        }
      }

      if (state.showDialogue && state.selectedDialogue !== 'none' && state.dialogueText.trim()) {
        detections.forEach(d => {
          drawDialogueOnFace(d);
        });
      }
    }

    drawTimestampOnVideo();
  } catch (err) {
    safeErr('Face detection error:', err);
  }

  state.detectionInProgress = false;
  state.animationFrameId = requestAnimationFrame(detectFacesLive);
}

// Initialize filter
export async function initializeFilter() {
  if (!state.filterActive) {
    const ok = await loadFaceModels();
    if (!ok) return;
    state.filterActive = true;
  }

  overlayCtx.clearRect(0, 0, elements.overlay.width, elements.overlay.height);
  detectFacesLive();
}