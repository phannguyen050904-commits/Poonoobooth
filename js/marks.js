// marks.js - Updated with position controls
import { state } from './state.js';
import { elements, ctx, overlayCtx } from './dom.js';
import { safeLog, safeErr } from './utils.js';

// State cho marks
export const marksState = {
  selectedMark: 'none',
  marksImages: {},
  marksConfigs: [
    { name: "Lê, Huyền", path: "marks/Lê, Huyền.png", scale: 0.40, x: 0.5, y: 0.7 },
    { name: "Khánh", path: "marks/Khánh.png", scale: 0.40, x: 0.5, y: 0.7 }
  ],
  markOffsetX: 0,
  markOffsetY: 0,
  markScale: 1.0,
  markActive: false
};

// Khởi tạo marks system
export function initializeMarks() {
  preloadMarks();
  setupMarksEventListeners();
  setupMarksPositionControls();
}

// Preload marks images
export function preloadMarks() {
  marksState.marksConfigs.forEach(mark => {
    const img = new Image();
    img.src = mark.path;
    marksState.marksImages[mark.name] = {
      image: img,
      scale: mark.scale || 1.0,
      x: mark.x || 0.5,
      y: mark.y || 0.1,
      originalScale: mark.scale || 1.0
    };
    img.addEventListener('load', () => safeLog(`Mark loaded: ${mark.name}`));
    img.addEventListener('error', (err) => safeErr(`Mark failed to load: ${mark.name}`, err));
  });
}

// Setup event listeners cho marks
export function setupMarksEventListeners() {
  const marksSelect = document.getElementById('marksSelect');
  if (!marksSelect) {
    safeErr('marksSelect element not found');
    return;
  }

  const selected = marksSelect.querySelector('.selected');
  const options = marksSelect.querySelectorAll('.select-menu li');

  // Thêm event listener cho selected
  selected.addEventListener('click', (e) => {
    e.stopPropagation();
    marksSelect.classList.toggle('open');
  });

  // Thêm event listener cho các option
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const value = opt.dataset.value;
      selected.textContent = opt.textContent;
      marksSelect.classList.remove('open');
      marksState.selectedMark = value;
      marksState.markActive = value !== 'none';
      
      // Hiển thị/ẩn điều khiển vị trí
      const positionControls = document.getElementById('marksPositionControls');
      if (positionControls) {
        positionControls.style.display = marksState.markActive ? 'block' : 'none';
      }
      
      safeLog(`Mark selected: ${value}`);
    });
  });

  // Close dropdown khi click ra ngoài
  document.addEventListener('click', () => {
    marksSelect.classList.remove('open');
  });
}

// Setup position controls cho marks
export function setupMarksPositionControls() {
  // Tạo HTML cho điều khiển vị trí nếu chưa có
  if (!document.getElementById('marksPositionControls')) {
    const positionHTML = `
      <div class="control-group" id="marksPositionControls" style="display: none;">
        <label>Điều chỉnh vị trí marks:</label>
        <div class="position-controls">
          <div class="position-row">
            <button class="marks-position-btn" data-direction="up">↑</button>
          </div>
          <div class="position-row">
            <button class="marks-position-btn" data-direction="left">←</button>
            <button class="marks-position-btn" data-direction="center">↺</button>
            <button class="marks-position-btn" data-direction="right">→</button>
          </div>
          <div class="position-row">
            <button class="marks-position-btn" data-direction="down">↓</button>
          </div>
        </div>
        <div class="position-values">
          <span>Offset X: <span id="marksOffsetXValue">0</span></span>
          <span>Offset Y: <span id="marksOffsetYValue">0</span></span>
        </div>
        <div class="control-group">
          <label for="marksScale">Kích thước:</label>
          <input type="range" id="marksScale" min="50" max="200" value="100" />
          <span id="marksScaleValue">100%</span>
        </div>
      </div>
    `;
    
    // Tìm vị trí để chèn HTML
    const marksSelectGroup = document.querySelector('.control-group label[for="marksSelect"]')?.parentElement;
    if (marksSelectGroup) {
      marksSelectGroup.insertAdjacentHTML('afterend', positionHTML);
    }
  }
  
  // Thêm event listeners cho các nút điều khiển
  document.querySelectorAll('.marks-position-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const direction = e.target.dataset.direction;
      const step = 0.02; // Step nhỏ hơn cho mịn hơn
      
      if (direction === 'center') {
        marksState.markOffsetX = 0;
        marksState.markOffsetY = 0;
        marksState.markScale = 1.0;
        document.getElementById('marksScale').value = 100;
        document.getElementById('marksScaleValue').textContent = '100%';
      } else {
        switch(direction) {
          case 'up': marksState.markOffsetY -= step; break;
          case 'down': marksState.markOffsetY += step; break;
          case 'left': marksState.markOffsetX -= step; break;
          case 'right': marksState.markOffsetX += step; break;
        }
      }
      
      updateMarksOffsetDisplay();
      
      // Kích hoạt redraw
      if (marksState.markActive && state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        redrawMarks();
      }
    });
  });
  
  // Thêm event listener cho slider kích thước
  const marksScaleSlider = document.getElementById('marksScale');
  if (marksScaleSlider) {
    marksScaleSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      marksState.markScale = val / 100;
      document.getElementById('marksScaleValue').textContent = `${val}%`;
      
      // Kích hoạt redraw
      if (marksState.markActive && state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        redrawMarks();
      }
    });
  }
}

// Cập nhật hiển thị offset
function updateMarksOffsetDisplay() {
  const offsetXValue = document.getElementById('marksOffsetXValue');
  const offsetYValue = document.getElementById('marksOffsetYValue');
  
  if (offsetXValue && offsetYValue) {
    offsetXValue.textContent = marksState.markOffsetX.toFixed(3);
    offsetYValue.textContent = marksState.markOffsetY.toFixed(3);
  }
}

// Vẽ marks lên overlay (video)
export function drawMarksOnOverlay() {
  if (!marksState.markActive || !elements.overlay) return;

  const mark = marksState.marksImages[marksState.selectedMark];
  if (!mark || !mark.image.complete) return;

  const markWidth = elements.overlay.width * mark.scale * marksState.markScale;
  const markHeight = (mark.image.naturalHeight / mark.image.naturalWidth) * markWidth;
  
  // Tính toán vị trí với offset
  const centerX = elements.overlay.width * mark.x + (marksState.markOffsetX * elements.overlay.width);
  const centerY = elements.overlay.height * mark.y + (marksState.markOffsetY * elements.overlay.height);
  
  const x = centerX - (markWidth / 2);
  const y = centerY - (markHeight / 2);

  overlayCtx.save();
  overlayCtx.globalAlpha = 1.0;
  overlayCtx.drawImage(
    mark.image,
    x,
    y,
    markWidth,
    markHeight
  );
  overlayCtx.restore();
}

// Vẽ marks lên canvas chính (photo strip)
export function drawMarksOnCanvas() {
  if (!marksState.markActive) return;

  const mark = marksState.marksImages[marksState.selectedMark];
  if (!mark || !mark.image.complete) return;

  for (let row = 0; row < state.rows; row++) {
    for (let col = 0; col < state.cols; col++) {
      const x = state.leftside + col * state.frameW;
      const y = row * state.frameH;
      
      const markWidth = state.frameW * mark.scale * marksState.markScale;
      const markHeight = (mark.image.naturalHeight / mark.image.naturalWidth) * markWidth;
      
      const centerX = x + (state.frameW * mark.x) + (marksState.markOffsetX * state.frameW);
      const centerY = y + (state.frameH * mark.y) + (marksState.markOffsetY * state.frameH);
      
      const markX = centerX - (markWidth / 2);
      const markY = centerY - (markHeight / 2);

      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(
        mark.image,
        markX,
        markY,
        markWidth,
        markHeight
      );
      ctx.restore();
    }
  }
}

// Thêm mark vào ảnh đã chụp
export function addMarkToCapturedFrame(context, frameX, frameY, frameWidth, frameHeight) {
  if (!marksState.markActive) return;

  const mark = marksState.marksImages[marksState.selectedMark];
  if (!mark || !mark.image.complete) return;

  const markWidth = frameWidth * mark.scale * marksState.markScale;
  const markHeight = (mark.image.naturalHeight / mark.image.naturalWidth) * markWidth;
  
  const centerX = frameX + (frameWidth * mark.x) + (marksState.markOffsetX * frameWidth);
  const centerY = frameY + (frameHeight * mark.y) + (marksState.markOffsetY * frameHeight);
  
  const x = centerX - (markWidth / 2);
  const y = centerY - (markHeight / 2);

  context.save();
  context.globalAlpha = 1.0;
  context.drawImage(
    mark.image,
    x,
    y,
    markWidth,
    markHeight
  );
  context.restore();
}

// Vẽ lại tất cả marks
export function redrawMarks() {
  if (!marksState.markActive) return;
  
  // Xóa overlay cũ
  overlayCtx.clearRect(0, 0, elements.overlay.width, elements.overlay.height);
  
  // Vẽ lại các hiệu ứng khác trước
  if (typeof drawGrainOverlay === 'function') {
    drawGrainOverlay();
  }
  
  // Vẽ mark mới
  drawMarksOnOverlay();
  
  // Vẽ timestamp nếu có
  if (typeof drawTimestampOnVideo === 'function') {
    drawTimestampOnVideo();
  }
}