// capture.js - Complete with marks integration
import { state } from './state.js';
import { elements, ctx } from './dom.js';
import { redrawGridLines, drawThemeOverlayTo } from './canvas.js';
import { drawGrainOnCanvas, drawTimestamp } from './effects.js';
import { addMarkToCapturedFrame } from './marks.js';

// Capture single frame
export function captureFrame(index) {
  const row = Math.floor(index / state.cols);
  const col = index % state.cols;
  const x = state.leftside + col * state.frameW;
  const y = row * state.frameH;

  ctx.save();
  ctx.translate(x + state.frameW, y);
  ctx.scale(-1, 1);

  // Vẽ nền trắng
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, state.frameW, state.frameH);

  // Cắt và vẽ video
  const videoAspect = elements.video.videoWidth / elements.video.videoHeight;
  const frameAspect = state.frameW / state.frameH;
  
  let sourceX = 0, sourceY = 0, sourceWidth = elements.video.videoWidth, sourceHeight = elements.video.videoHeight;

  if (frameAspect > videoAspect) {
    const cropHeight = elements.video.videoWidth / frameAspect;
    sourceY = (elements.video.videoHeight - cropHeight) / 2;
    sourceHeight = cropHeight;
  } else {
    const cropWidth = elements.video.videoHeight * frameAspect;
    sourceX = (elements.video.videoWidth - cropWidth) / 2;
    sourceWidth = cropWidth;
  }

  ctx.drawImage(
    elements.video,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, state.frameW, state.frameH
  );

  // Vẽ overlay nếu có
  if (elements.overlay.width > 0 && elements.overlay.height > 0) {
    const overlaySourceX = (elements.overlay.width / elements.video.videoWidth) * sourceX;
    const overlaySourceY = (elements.overlay.height / elements.video.videoHeight) * sourceY;
    const overlaySourceWidth = (elements.overlay.width / elements.video.videoWidth) * sourceWidth;
    const overlaySourceHeight = (elements.overlay.height / elements.video.videoHeight) * sourceHeight;
    
    ctx.drawImage(
      elements.overlay,
      overlaySourceX, overlaySourceY, overlaySourceWidth, overlaySourceHeight,
      0, 0, state.frameW, state.frameH
    );
  }

  // Vẽ grain effect
  drawGrainOnCanvas(ctx, 0, 0, state.frameW, state.frameH);
  
  // Vẽ timestamp
  drawTimestamp(ctx, 0, 0, state.frameW, state.frameH);
  
  // Vẽ marks - THÊM DÒNG NÀY
  addMarkToCapturedFrame(ctx, 0, 0, state.frameW, state.frameH);

  ctx.restore();

  // Vẽ lại grid hoặc theme
  if (state.showGrid) {
    redrawGridLines();
  } else {
    drawThemeOverlayTo(ctx);
  }
}

// Start capture process
export function startCapture() {
  elements.startBtn.style.display = 'none';
  elements.statusText.style.display = 'block';

  let count = 0;
  let timeLeft = Math.max(1, parseInt(elements.countdownInput.value) || 5);

  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      captureFrame(count);
      count++;
      if (count >= state.cols * state.rows) {
        clearInterval(timer);
        elements.statusText.textContent = 'Tada!!!';
        setTimeout(() => {
          elements.startBtn.style.display = 'block';
          elements.statusText.style.display = 'none';
        }, 3000);

        // Tải ảnh xuống
        const link = document.createElement('a');
        link.download = 'photo_strip.png';
        link.href = elements.canvas.toDataURL();
        link.click();
        return;
      }
      timeLeft = Math.max(1, parseInt(elements.countdownInput.value) || 5);
    }
    elements.statusText.textContent = `Ảnh ${count + 1}/${state.cols * state.rows} chụp sau ${timeLeft--}s`;
  }, 1000);
}