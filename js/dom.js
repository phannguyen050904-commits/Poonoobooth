// dom.js - Updated version
// DOM element references
export const elements = {
  // Video and canvas
  video: document.getElementById('video'),
  overlay: document.getElementById('overlay'),
  canvas: document.getElementById('canvas'),
  videoContainer: document.querySelector('.video-container'),
  
  // Buttons and status
  startBtn: document.getElementById('start'),
  statusText: document.getElementById('status'),
  
  // Controls
  frameColorPicker: document.getElementById('frameColor'),
  countdownInput: document.getElementById('countdownTime'),
  gridToggle: document.getElementById('gridToggle'),
  canvasLayoutSelect: document.getElementById('canvasLayout'),
  
  // Grain
  grainSelect: document.getElementById('grainSelect'),
  grainOpacitySlider: document.getElementById('grainOpacity'),
  grainOpacityValue: document.getElementById('grainOpacityValue'),
  
  // Timestamp
  timestampControls: document.getElementById('timestampControls'),
  timestampToggle: document.getElementById('timestampToggle'),
  timestampFormatSel: document.getElementById('timestampFormat'),
  timestampFontSel: document.getElementById('timestampFont'),
  timestampSizeInput: document.getElementById('timestampSize'),
  timestampColorInput: document.getElementById('timestampColor'),
  timestampPositionSel: document.getElementById('timestampPosition'),
  customFormatInput: document.getElementById('customFormat'),
  customFormatGroup: document.getElementById('customFormatGroup'),
  
  // Filter
  filterSelect: document.getElementById('filterSelect'),
  filterSelected: document.getElementById('filterSelect').querySelector('.selected'),
  filterOptions: document.querySelectorAll('#filterSelect .select-menu > li:not(.dst-parent)'),
  dstOptions: document.querySelectorAll('#filterSelect .dst-submenu li'),
  filterPositionControls: document.getElementById('filterPositionControls'),
  offsetXValue: document.getElementById('offsetXValue'),
  offsetYValue: document.getElementById('offsetYValue'),
  positionBtns: document.querySelectorAll('.position-btn'),
  
  // Dialogue
  dialogueToggle: document.getElementById('dialogueToggle'),
  dialogueControls: document.getElementById('dialogueControls'),
  dialogueSelect: document.getElementById('dialogueSelect'),
  dialogueTextInput: document.getElementById('dialogueText'),
  dialogueFontSel: document.getElementById('dialogueFont'),
  dialogueSizeInput: document.getElementById('dialogueSize'),
  dialogueColorInput: document.getElementById('dialogueColor'),
  dialoguePositionSel: document.getElementById('dialoguePosition'),
  dialogueScaleInput: document.getElementById('dialogueScale'),
  dialogueScaleValue: document.getElementById('dialogueScaleValue'),
  
  // Theme
  themeSelect: document.getElementById('themeSelect'),
  themeSelected: document.getElementById('themeSelect').querySelector('.selected'),
  themeOptions: document.querySelectorAll('#themeSelect .select-menu > li:not(.theme-parent)'),
  themeSubOptions: document.querySelectorAll('#themeSelect .theme-submenu li'),
  
  // Weather
  weatherParent: document.querySelector('.weather-parent'),
  weatherSubmenu: document.querySelector('.weather-submenu'),
  weatherOptions: document.querySelectorAll('.weather-submenu li'),
  
  // Music
  musicParent: document.querySelector('.music-parent'),
  musicSubmenu: document.querySelector('.music-submenu'),
  musicOptions: document.querySelectorAll('.music-submenu li'),
  
  // Lyrics
  lyricsContainer: document.getElementById('lyricsContainer'),
  lyricsText: document.getElementById('lyricsText'),
  
  // Marks - THÊM PHẦN NÀY
  marksSelect: document.getElementById('marksSelect')
};

// Get canvas contexts
export const ctx = elements.canvas.getContext('2d');
export const overlayCtx = elements.overlay.getContext('2d');