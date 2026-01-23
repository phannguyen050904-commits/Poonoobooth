// App state management
export const state = {
  // Canvas and layout
  frameColor: '#4f6d8f',
  currentTheme: 'none',
  currentCanvasLayout: '1x1',
  canvasWidth: 960,
  canvasHeight: 1280,
  rows: 3,
  cols: 2,
  frameW: 0,
  frameH: 0,
  bottomPadding: 0,
  leftside: 0,
  rightside: 0,
  showGrid: true,
  
  // Filter
  selectedFilter: 'none',
  filterActive: false,
  filterOffsetX: 0,
  filterOffsetY: 0,
  currentFilterAdjustments: {},
  
  // Grain
  currentGrain: 'none',
  grainOpacity: 0.25,
  
  // Timestamp
  showTimestamp: false,
  timestampFormat: 'dd/mm/yyyy',
  timestampFont: 'FontTime',
  timestampSize: 36,
  timestampColor: '#ffffff',
  timestampPosition: 'bottom-right',
  customTimestampFormat: '',
  
  // Dialogue
  showDialogue: false,
  selectedDialogue: 'none',
  dialogueText: '',
  dialogueFont: 'MyFont',
  dialogueSize: 16,
  dialogueColor: '#000000',
  dialoguePosition: 'top-left',
  dialogueScale: 1.0,
  
  // Weather
  currentWeather: 'none',
  leafInterval: null,
  snowInterval: null,
  rainInterval: null,
  petalInterval: null,
  
  // Music
  currentMusic: 'none',
  lyricsInterval: null,
  currentLyricIndex: 0,
  
  // Face detection
  detectionInProgress: false,
  animationFrameId: null,
  faceModelsLoaded: false
};

// Asset storage
export const assets = {
  themeImages: {},
  filterImages: {},
  dialogueImages: {},
  grainVideos: {}
};