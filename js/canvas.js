import { canvasLayouts } from './config.js';
import { state, assets } from './state.js';
import { elements, ctx } from './dom.js';

// Update video aspect ratio
export function updateVideoAspectRatio(layout) {
  if (!elements.videoContainer) return;
  
  if (layout === '1x1') {
    elements.videoContainer.style.aspectRatio = '1 / 1';
    elements.videoContainer.style.maxWidth = '480px';
    elements.videoContainer.classList.add('aspect-1-1');
  } else {
    elements.videoContainer.style.aspectRatio = '4 / 3';
    elements.videoContainer.style.maxWidth = '480px';
    elements.videoContainer.classList.remove('aspect-1-1');
  }
}

// Update canvas layout
export function updateCanvasLayout(layout) {
  if (!canvasLayouts[layout]) return;
  
  state.currentCanvasLayout = layout;
  const config = canvasLayouts[layout];
  
  state.canvasWidth = config.width;
  state.canvasHeight = config.height;
  state.rows = config.rows;
  state.cols = config.cols;
  state.bottomPadding = config.bottomPadding;
  state.leftside = config.leftside || 0;
  state.rightside = config.rightside || 0;

  elements.canvas.width = state.canvasWidth;
  elements.canvas.height = state.canvasHeight;
  
  state.frameW = (state.canvasWidth - state.leftside - state.rightside) / state.cols;
  state.frameH = (state.canvasHeight - state.bottomPadding) / state.rows;
  
  updateVideoAspectRatio(layout);
  drawGrid();
}

// Draw grid
export function drawGrid() {
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

  if (state.showGrid) {
    ctx.strokeStyle = state.frameColor;
    drawOuterFrameTo(ctx);

    const innerLineWidth = 20;
    ctx.lineWidth = innerLineWidth;

    if (state.cols > 1) {
      for (let i = 1; i < state.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * state.frameW, 0);
        ctx.lineTo(i * state.frameW, elements.canvas.height);
        ctx.stroke();
      }
    }

    if (state.rows > 1) {
      for (let i = 1; i < state.rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * state.frameH);
        ctx.lineTo(elements.canvas.width, i * state.frameH);
        ctx.stroke();
      }
    }
  }

  drawThemeOverlayTo(ctx);
}

// Draw outer frame
export function drawOuterFrameTo(ctxRef) {
  if (!state.showGrid) return;

  const outerLineWidth = 20;
  const bottomLineWidth = state.bottomPadding || 20;
  const topLineWidth = 20;

  ctxRef.strokeStyle = state.frameColor;
  ctxRef.lineWidth = outerLineWidth;
  ctxRef.beginPath();
  ctxRef.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(state.canvasWidth - outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(outerLineWidth / 2, state.canvasHeight - outerLineWidth / 2);
  ctxRef.moveTo(state.canvasWidth - outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(state.canvasWidth - outerLineWidth / 2, state.canvasHeight - outerLineWidth / 2);
  ctxRef.stroke();

  if (state.bottomPadding > 0) {
    ctxRef.lineWidth = bottomLineWidth;
    ctxRef.beginPath();
    
    const shortBottomWidth = state.canvasWidth;
    const startX = (state.canvasWidth - shortBottomWidth) / 2;
    ctxRef.moveTo(startX, state.canvasHeight - bottomLineWidth / 2);
    ctxRef.lineTo(startX + shortBottomWidth, state.canvasHeight - bottomLineWidth / 2);
    ctxRef.stroke();
  }

  ctxRef.lineWidth = topLineWidth;
  ctxRef.beginPath();
  ctxRef.moveTo(0, topLineWidth / 2);
  ctxRef.lineTo(state.canvasWidth, topLineWidth / 2);
  ctxRef.stroke();
}

// Draw theme overlay
export function drawThemeOverlayTo(ctxRef) {
  if (state.currentTheme !== 'none' && assets.themeImages[state.currentTheme]) {
    const img = assets.themeImages[state.currentTheme];
    if (img.complete && img.naturalHeight > 0) {
      ctxRef.drawImage(img, 0, 0, elements.canvas.width, elements.canvas.height);
    }
  }
}

// Redraw grid lines
export function redrawGridLines() {
  if (!state.showGrid) return;

  ctx.strokeStyle = state.frameColor;
  ctx.lineWidth = 20;
  if (state.cols > 1) {
    for (let i = 1; i < state.cols; i++) {
      ctx.beginPath();
      ctx.moveTo(state.leftside + i * state.frameW, 0);
      ctx.lineTo(state.leftside + i * state.frameW, state.canvasHeight);
      ctx.stroke();
    }
  }
  
  if (state.rows > 1) {
    for (let i = 1; i < state.rows; i++) {
      ctx.beginPath();
      ctx.moveTo(state.leftside, i * state.frameH);
      ctx.lineTo(state.canvasWidth - state.rightside, i * state.frameH);
      ctx.stroke();
    }
  }
  
  drawOuterFrameTo(ctx);
  drawThemeOverlayTo(ctx);
}