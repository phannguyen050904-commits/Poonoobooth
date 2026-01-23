import { state, assets } from './state.js';
import { elements } from './dom.js';
import { drawGrid, updateCanvasLayout } from './canvas.js';
import { detectFacesLive, initializeFilter } from './faceDetection.js';
import { updateWeatherEffects } from './weather.js';
import { updateMusicEffects } from './music.js';
import { startCapture } from './capture.js';
import { handleResize } from './camera.js';
// Thêm vào phần import của events.js nếu chưa có
// Toggle filter position controls
export function toggleFilterPositionControls() {
  if (state.selectedFilter !== 'none') {
    elements.filterPositionControls.style.display = 'block';
    const filterKey = state.selectedFilter;
    if (state.currentFilterAdjustments[filterKey]) {
      state.filterOffsetX = state.currentFilterAdjustments[filterKey].x;
      state.filterOffsetY = state.currentFilterAdjustments[filterKey].y;
    } else {
      state.filterOffsetX = 0;
      state.filterOffsetY = 0;
    }
    updateOffsetDisplay();
  } else {
    elements.filterPositionControls.style.display = 'none';
  }
}

// Update offset display
function updateOffsetDisplay() {
  if (elements.offsetXValue && elements.offsetYValue) {
    elements.offsetXValue.textContent = state.filterOffsetX.toFixed(2);
    elements.offsetYValue.textContent = state.filterOffsetY.toFixed(2);
  }
}

// Reset filter position
function resetFilterPosition() {
  state.filterOffsetX = 0;
  state.filterOffsetY = 0;
  updateOffsetDisplay();
  if (state.selectedFilter !== 'none') {
    state.currentFilterAdjustments[state.selectedFilter] = { x: 0, y: 0 };
  }
}

// Initialize all event listeners
export function initializeEventListeners() {
  // Capture button
  elements.startBtn.addEventListener('click', startCapture);

  // Frame color
  elements.frameColorPicker.addEventListener('input', (e) => {
    state.frameColor = e.target.value;
    drawGrid();
  });

  // Canvas layout
  elements.canvasLayoutSelect.addEventListener('change', (e) => {
    updateCanvasLayout(e.target.value);
  });

  // Grid toggle
  elements.gridToggle.addEventListener('change', (e) => {
    state.showGrid = e.target.checked;
    drawGrid();
  });

  // Theme controls
  elements.themeSelected.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.themeSelect.classList.toggle("open");
  });

  elements.themeOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      const value = opt.dataset.value;
      elements.themeSelected.textContent = opt.textContent;
      elements.themeSelect.classList.remove("open");
      state.currentTheme = value;
      drawGrid();
    });
  });

  elements.themeSubOptions.forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = opt.dataset.value;
      const parentText = opt.closest('.theme-parent').textContent.split('→')[0].trim();
      elements.themeSelected.textContent = `${parentText} - ${opt.textContent}`;
      elements.themeSelect.classList.remove("open");
      state.currentTheme = value;
      drawGrid();
    });
  });

  // Filter controls
  elements.filterSelected.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.filterSelect.classList.toggle("open");
  });

  elements.filterOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      const value = opt.dataset.value;
      elements.filterSelected.textContent = opt.textContent;
      elements.filterSelect.classList.remove("open");
      state.selectedFilter = value;
      toggleFilterPositionControls();
      if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
      state.selectedFilter === 'none' ? state.filterActive = false : initializeFilter();
    });
  });

  elements.dstOptions.forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = opt.dataset.value;
      elements.filterSelected.textContent = opt.textContent;
      elements.filterSelect.classList.remove("open");
      state.selectedFilter = value;
      toggleFilterPositionControls();
      if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
      initializeFilter();
    });
  });

  // Filter position controls
  elements.positionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const direction = e.target.dataset.direction;
      if (direction === 'center') {
        resetFilterPosition();
      } else {
        const step = 0.01;
        switch(direction) {
          case 'up': state.filterOffsetY -= step; break;
          case 'down': state.filterOffsetY += step; break;
          case 'left': state.filterOffsetX -= step; break;
          case 'right': state.filterOffsetX += step; break;
        }
        updateOffsetDisplay();
      }
      if (state.selectedFilter !== 'none') {
        state.currentFilterAdjustments[state.selectedFilter] = { 
          x: state.filterOffsetX, 
          y: state.filterOffsetY 
        };
      }
      if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
      detectFacesLive();
    });
  });

  // Grain controls
  elements.grainSelect.addEventListener('change', () => {
    state.currentGrain = elements.grainSelect.value;
    Object.values(assets.grainVideos).forEach(v => {
      try { v.pause(); v.currentTime = 0; } catch (e) {}
    });
    if (state.currentGrain !== 'none' && assets.grainVideos[state.currentGrain]) {
      assets.grainVideos[state.currentGrain].play().catch(() => {});
    }
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.grainOpacitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.grainOpacity = val / 100;
    elements.grainOpacityValue.textContent = `${val}%`;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  // Timestamp controls
  elements.timestampToggle.addEventListener('change', (e) => {
    state.showTimestamp = e.target.checked;
    elements.timestampControls.style.display = state.showTimestamp ? 'block' : 'none';
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.timestampFormatSel.addEventListener('change', (e) => {
    state.timestampFormat = e.target.value;
    elements.customFormatGroup.style.display = state.timestampFormat === 'custom' ? 'flex' : 'none';
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.timestampFontSel.addEventListener('change', (e) => {
    state.timestampFont = e.target.value;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.timestampSizeInput.addEventListener('change', (e) => {
    state.timestampSize = parseInt(e.target.value) || 16;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  if (elements.timestampColorInput) {
    elements.timestampColorInput.addEventListener('input', (e) => {
      state.timestampColor = e.target.value;
      if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
      detectFacesLive();
    });
  }

  elements.timestampPositionSel.addEventListener('change', (e) => {
    state.timestampPosition = e.target.value;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.customFormatInput.addEventListener('input', (e) => {
    state.customTimestampFormat = e.target.value;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  // Dialogue controls
  elements.dialogueToggle.addEventListener('change', (e) => {
    state.showDialogue = e.target.checked;
    elements.dialogueControls.style.display = state.showDialogue ? 'block' : 'none';
    if (state.showDialogue && !state.filterActive) {
      initializeFilter();
    } else {
      if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
      detectFacesLive();
    }
  });

  elements.dialogueSelect.addEventListener('change', (e) => {
    state.selectedDialogue = e.target.value;
    if (state.showDialogue && state.selectedDialogue !== 'none' && !state.filterActive) {
      initializeFilter();
    } else {
      if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
      detectFacesLive();
    }
  });

  elements.dialogueTextInput.addEventListener('input', (e) => {
    state.dialogueText = e.target.value;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.dialogueFontSel.addEventListener('change', (e) => {
    state.dialogueFont = e.target.value;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.dialogueSizeInput.addEventListener('change', (e) => {
    state.dialogueSize = parseInt(e.target.value) || 16;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.dialogueColorInput.addEventListener('input', (e) => {
    state.dialogueColor = e.target.value;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.dialoguePositionSel.addEventListener('change', (e) => {
    state.dialoguePosition = e.target.value;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  elements.dialogueScaleInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.dialogueScale = val / 100;
    elements.dialogueScaleValue.textContent = `${val}%`;
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    detectFacesLive();
  });

  // Weather controls
  elements.weatherParent.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.weatherSubmenu.style.display = elements.weatherSubmenu.style.display === 'block' ? 'none' : 'block';
  });

  elements.weatherOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      state.currentWeather = opt.dataset.value;
      updateWeatherEffects();
      elements.weatherSubmenu.style.display = 'none';
    });
  });

  // Music controls
  elements.musicParent.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.musicSubmenu.style.display = elements.musicSubmenu.style.display === 'block' ? 'none' : 'block';
  });

  elements.musicOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      state.currentMusic = opt.dataset.value;
      updateMusicEffects();
      elements.musicSubmenu.style.display = 'none';
    });
  });

  // Video event listeners
  elements.video.addEventListener('loadedmetadata', handleResize);
  window.addEventListener('resize', handleResize);
  elements.video.addEventListener('play', handleResize);

  // Close dropdowns on outside click
  document.addEventListener("click", () => {
    elements.themeSelect.classList.remove("open");
    elements.filterSelect.classList.remove("open");
    elements.weatherSubmenu.style.display = 'none';
    elements.musicSubmenu.style.display = 'none';
  });
}

