// main.js - Updated version
import { preloadAll } from './assets.js';
import { startCamera } from './camera.js';
import { drawGrid, updateCanvasLayout } from './canvas.js';
import { detectFacesLive } from './faceDetection.js';
import { updateWeatherEffects } from './weather.js';
import { updateMusicEffects } from './music.js';
import { initializeEventListeners } from './events.js';
import { initializeMarks } from './marks.js';
import { elements } from './dom.js';
import { state } from './state.js';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  // Hide controls initially
  elements.timestampControls.style.display = 'none';
  elements.dialogueControls.style.display = 'none';
  elements.timestampToggle.checked = false;
  elements.dialogueToggle.checked = false;
  
  // Cancel any existing animation frame
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
  }
  
  // Start face detection loop
  detectFacesLive();
  
  // Initialize effects
  updateWeatherEffects();
  updateMusicEffects();
  
  // Initialize marks system - ĐÃ CÓ
  initializeMarks();
  
  // Set default canvas layout
  updateCanvasLayout('3x2');
  
  // Initialize all event listeners
  initializeEventListeners();
  
  // Log initialization
  console.log('PooNoobooth initialized with marks support');
});

// Start camera and preload assets
startCamera();
preloadAll();
drawGrid();