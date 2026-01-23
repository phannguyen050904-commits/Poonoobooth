import { state, assets } from './state.js';
import { elements, overlayCtx } from './dom.js';
import { formatTimestamp } from './utils.js';

// Draw grain overlay on video overlay
export function drawGrainOverlay() {
  if (state.currentGrain !== 'none' && assets.grainVideos[state.currentGrain]) {
    const v = assets.grainVideos[state.currentGrain];
    if (v.readyState >= v.HAVE_CURRENT_DATA) {
      overlayCtx.globalAlpha = state.grainOpacity;
      overlayCtx.drawImage(v, 0, 0, elements.overlay.width, elements.overlay.height);
      overlayCtx.globalAlpha = 1.0;
    }
  } else {
    overlayCtx.clearRect(0, 0, elements.overlay.width, elements.overlay.height);
  }
}

// Draw grain on canvas
export function drawGrainOnCanvas(context, x, y, width, height) {
  if (state.currentGrain !== 'none' && assets.grainVideos[state.currentGrain]) {
    const v = assets.grainVideos[state.currentGrain];
    if (v.readyState >= v.HAVE_CURRENT_DATA) {
      context.globalAlpha = state.grainOpacity;
      context.drawImage(v, x, y, width, height);
      context.globalAlpha = 1.0;
    }
  }
}

// Draw timestamp on video overlay
export function drawTimestampOnVideo() {
  if (!state.showTimestamp) return;

  const now = new Date();
  const text = formatTimestamp(now, state.timestampFormat, state.customTimestampFormat);
  const fontFamily = document.fonts && document.fonts.check && 
                     document.fonts.check(`12px ${state.timestampFont}`) ? 
                     state.timestampFont : 'monospace';
  
  let sidepadding, bottomPadding, fontSize;
  
  if (state.currentCanvasLayout === '1x1') {
    sidepadding = 100;
    bottomPadding = 50;
    fontSize = state.timestampSize * 0.5;
  } else {
    sidepadding = 25;
    bottomPadding = 25;
    fontSize = state.timestampSize;
  }
  
  let posX, posY, align;
  
  switch (state.timestampPosition) {
    case 'top-left':
      posX = elements.overlay.width - sidepadding;
      posY = bottomPadding + fontSize;
      align = 'right';
      break;
    case 'top-right':
      posX = sidepadding;
      posY = bottomPadding + fontSize;
      align = 'left';
      break;
    case 'bottom-left':
      posX = elements.overlay.width - sidepadding;
      posY = elements.overlay.height - fontSize;
      align = 'right';
      break;
    case 'bottom-right':
      posX = sidepadding;
      posY = elements.overlay.height - fontSize;
      align = 'left';
      break;
    default:
      posX = sidepadding;
      posY = elements.overlay.height - bottomPadding;
      align = 'left';
  }

  overlayCtx.save();
  overlayCtx.translate(elements.overlay.width, 0);
  overlayCtx.scale(-1, 1);

  overlayCtx.font = `${state.timestampSize}px ${fontFamily}`;
  overlayCtx.fillStyle = state.timestampColor;
  overlayCtx.textAlign = align;
  overlayCtx.textBaseline = 'bottom';
  overlayCtx.lineWidth = 3;
  overlayCtx.strokeStyle = '#000';
  overlayCtx.lineJoin = 'round';
  overlayCtx.shadowColor = 'rgba(0,0,0,0.7)';
  overlayCtx.shadowBlur = 4;
  overlayCtx.shadowOffsetX = 2;
  overlayCtx.shadowOffsetY = 2;

  overlayCtx.fillText(text, posX, posY);
  overlayCtx.restore();
}

// Draw timestamp on canvas
export function drawTimestamp(context, x, y, width, height) {
  if (!state.showTimestamp) return;

  const now = new Date();
  const text = formatTimestamp(now, state.timestampFormat, state.customTimestampFormat);
  const fontFamily = document.fonts && document.fonts.check && 
                     document.fonts.check(`12px ${state.timestampFont}`) ? 
                     state.timestampFont : 'monospace';

  const padding = 20;
  let posX, posY, align;
  
  switch (state.timestampPosition) {
    case 'top-left':
      posX = width - padding; posY = padding + state.timestampSize; align = 'right';
      break;
    case 'top-right':
      posX = padding; posY = padding + state.timestampSize; align = 'left';
      break;
    case 'bottom-left':
      posX = width - padding; posY = height - padding; align = 'right';
      break;
    case 'bottom-right':
      posX = padding; posY = height - padding; align = 'left';
      break;
    case 'bottom-center':
      posX = width / 2; posY = height - padding; align = 'center';
      break;
    default:
      posX = padding; posY = height - padding; align = 'left';
  }

  context.save();
  if (state.currentCanvasLayout === '1x1') {
    context.translate(x, y);
    context.font = `${state.timestampSize}px ${fontFamily}`;
    context.fillStyle = state.timestampColor;
    context.textAlign = align;
    context.textBaseline = 'bottom';
    context.lineWidth = 3;
    context.strokeStyle = '#000';
    context.lineJoin = 'round';
    context.shadowColor = 'rgba(0,0,0,0.7)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(text, posX, posY);
  } else {
    context.translate(x + width, y);
    context.scale(-1, 1);
    context.font = `${state.timestampSize}px ${fontFamily}`;
    context.fillStyle = state.timestampColor;
    context.textAlign = align;
    context.textBaseline = 'bottom';
    context.lineWidth = 3;
    context.strokeStyle = '#000';
    context.lineJoin = 'round';
    context.shadowColor = 'rgba(0,0,0,0.7)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(text, posX, posY);
  }

  context.restore();
}