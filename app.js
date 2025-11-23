
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const overlayCtx = overlay.getContext('2d');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('start');
const statusText = document.getElementById('status');

const frameColorPicker = document.getElementById('frameColor');
const countdownInput = document.getElementById('countdownTime');

//grains=========================================================
const grainSelect = document.getElementById('grainSelect');
const grainOpacitySlider = document.getElementById('grainOpacity');
const grainOpacityValue = document.getElementById('grainOpacityValue');


// Timestamp========================================================
const timestampControls = document.getElementById('timestampControls');
const timestampToggle = document.getElementById('timestampToggle');
const timestampFormatSel = document.getElementById('timestampFormat');
const timestampFontSel = document.getElementById('timestampFont');
const timestampSizeInput = document.getElementById('timestampSize');
const timestampColorInput = document.getElementById('timestampColor') || null;
const timestampPositionSel = document.getElementById('timestampPosition');


const customFormatInput = document.getElementById('customFormat');
const customFormatGroup = document.getElementById('customFormatGroup');

// Filter & Theme========================================================
const filterSelect = document.getElementById('filterSelect');
const filterSelected = filterSelect.querySelector('.selected');
const filterOptions = filterSelect.querySelectorAll('.select-menu > li:not(.dst-parent)');
const dstOptions = filterSelect.querySelectorAll('.dst-submenu li');

// Dialogue========================================================
const dialogueToggle = document.getElementById('dialogueToggle');
const dialogueControls = document.getElementById('dialogueControls');
const dialogueSelect = document.getElementById('dialogueSelect');
const dialogueTextInput = document.getElementById('dialogueText');
const dialogueFontSel = document.getElementById('dialogueFont');
const dialogueSizeInput = document.getElementById('dialogueSize');
const dialogueColorInput = document.getElementById('dialogueColor');
const dialoguePositionSel = document.getElementById('dialoguePosition');

//theme==========================================================
const themeSelected = themeSelect.querySelector('.selected');
const themeOptions = themeSelect.querySelectorAll('.select-menu > li:not(.theme-parent)');
const themeSubOptions = themeSelect.querySelectorAll('.theme-submenu li');

//grid==============================================================
const gridToggle = document.getElementById('gridToggle');

//App state=================================================//
let frameColor = '#4f6d8f';
let currentTheme = 'none';
let selectedFilter = 'none';
let filterActive = false;

let themeImages = {};   
let filterImages = {};
let dialogueImages = {}; 

let grainVideos = {};  
let currentGrain = 'none';
let grainOpacity = 0.25;

let detectionInProgress = false;
let animationFrameId = null;
let faceModelsLoaded = false;

let showGrid = true; 


/* Timestamp state=====================================================*/
let showTimestamp = false;
let timestampFormat = 'dd/mm/yyyy';
let timestampFont = 'FontTime';
let timestampSize = 36;
let timestampColor = '#ffffff';
let timestampPosition = 'bottom-right';
let customTimestampFormat = '';

/* Dialogue state=====================================================*/
let showDialogue = false;
let selectedDialogue = 'none';
let dialogueText = '';
let dialogueFont = 'MyFont';
let dialogueSize = 16;
let dialogueColor = '#000000';
let dialoguePosition = 'top-left';
let dialogueScale = 1.0; // Thêm dòng này

let currentCanvasLayout = '1x1';
let canvasWidth = 960;
let canvasHeight = 1280;
let rows = 3;
let cols = 2;
let frameW, frameH, bottomPadding;
let leftside = 0;
let rightside = 0;


// frames====================================================================
const $ = id => document.getElementById(id);

function safeLog(...args) { console.log(...args); }
function safeErr(...args) { console.error(...args); }
const canvasLayouts = {
  '3x2': { width: 960, height: 1280, rows: 3, cols: 2, bottomPadding: 1280/(8-5/3), side: 0 },
  '4x1': { width: 480, height: 1440, rows: 4, cols: 1, bottomPadding: 120, rightside: 20 , leftside: 20},
  '2x2': { width: 960, height: 960, rows: 2, cols: 2, bottomPadding: 240 },
  '2x1': { width: 480, height: 960, rows: 2, cols: 1, bottomPadding: 240 },
  '1x1': { width: 480, height: 640, rows: 1, cols: 1, bottomPadding: 160 }
};
const videoContainer = document.querySelector('.video-container');

// cập nhật frames====================================================
function updateVideoAspectRatio(layout) {
  if (!videoContainer) return;
  
  if (layout === '1x1') {
    videoContainer.style.aspectRatio = '1 / 1';
    videoContainer.style.maxWidth = '480px';
    videoContainer.classList.add('aspect-1-1');
  } else {
    videoContainer.style.aspectRatio = '4 / 3';
    videoContainer.style.maxWidth = '480px';
    videoContainer.classList.remove('aspect-1-1');
  }
}
function updateCanvasLayout(layout) {
  if (!canvasLayouts[layout]) return;
  
  currentCanvasLayout = layout;
  const config = canvasLayouts[layout];
  
  canvasWidth = config.width;
  canvasHeight = config.height;
  rows = config.rows;
  cols = config.cols;
  bottomPadding = config.bottomPadding;
  
  leftside = config.leftside || 0;
  rightside = config.rightside || 0;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  frameW = (canvasWidth - leftside - rightside) / cols;
  frameH = (canvasHeight - bottomPadding) / rows;
  
  updateVideoAspectRatio(layout);
  drawGrid();
}

//Vẽ viền=====================================================
function drawGrid() {
    ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (showGrid) {
    ctx.strokeStyle = frameColor;
    drawOuterFrameTo(ctx);

    const innerLineWidth = 20;
    ctx.lineWidth = innerLineWidth;

    if (cols > 1) {
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * frameW, 0);
        ctx.lineTo(i * frameW, canvas.height);
        ctx.stroke();
      }
    }

    if (rows > 1) {
      for (let i = 1; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * frameH);
        ctx.lineTo(canvas.width, i * frameH);
        ctx.stroke();
      }
    }
  }

  drawThemeOverlayTo(ctx);
}
function drawOuterFrameTo(ctxRef) {
  if (!showGrid) return; 

  const outerLineWidth = 20;
  const bottomLineWidth = bottomPadding || 20;
  const topLineWidth = 20;

  ctxRef.strokeStyle = frameColor;

  ctxRef.lineWidth = outerLineWidth;
  ctxRef.beginPath();
  ctxRef.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(canvasWidth - outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(outerLineWidth / 2, canvasHeight - outerLineWidth / 2);
  ctxRef.moveTo(canvasWidth - outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(canvasWidth - outerLineWidth / 2, canvasHeight - outerLineWidth / 2);
  ctxRef.stroke();

  if (bottomPadding > 0) {
    ctxRef.lineWidth = bottomLineWidth;
    ctxRef.beginPath();
    
    let shortBottomWidth;
  
    switch(currentCanvasLayout) {
      case '4x1':
        shortBottomWidth = canvasWidth * 1; 
        break;
      case '3x2':
        shortBottomWidth = canvasWidth * 1; 
        break;
      case '2x2':
        shortBottomWidth = canvasWidth * 1; 
        break;
      case '1x1':
        shortBottomWidth = canvasWidth * 1; 
        break;
      default:
        shortBottomWidth = canvasWidth; 
    }
    
    const startX = (canvasWidth - shortBottomWidth) / 2;
    ctxRef.moveTo(startX, canvasHeight - bottomLineWidth / 2);
    ctxRef.lineTo(startX + shortBottomWidth, canvasHeight - bottomLineWidth / 2);
    ctxRef.stroke();
  }

  ctxRef.lineWidth = topLineWidth;
  ctxRef.beginPath();
  ctxRef.moveTo(0, topLineWidth / 2);
  ctxRef.lineTo(canvasWidth, topLineWidth / 2);
  ctxRef.stroke();
}



//camera setup==========================================================================//
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    safeErr('Cannot access camera:', err);
  }
}
startCamera();

//Preload: themes, filters, grains, fonts, dialogues=======================================//
function preloadThemes() {
  const themes = ['Đi làm', 'Danisa','Dont starve together 1', 'MCK','GAMTIME'];
  themes.forEach(name => {
    const img = new Image();
    img.src = `themes/${name}.png`;
    themeImages[name] = img;
    img.addEventListener('load', () => safeLog(`Theme loaded: ${name}`));
  });
}


//filters===================================================================//
function preloadFilters() {
  const filters = [
    { name: "Sơn Tùng-MTP", path: "filters/Sơn Tùng-MTP.png", offsetX: 0, offsetY: 2, scale: 3 },
    { name: "flower wreath", path: "filters/Dont starve together/flower wreath.png", offsetX: 0, offsetY: 0.5, scale: 2.3 },
    { name: "cylinder", path: "filters/Dont starve together/cylinder.png", offsetX: 0, offsetY: 0.7, scale: 2.7 },
    { name: "buffalo hat", path: "filters/Dont starve together/buffalo hat.png", offsetX: 0, offsetY: 0.6, scale: 3.6 },
    { name: "winter hat", path: "filters/Dont starve together/winter hat.png", offsetX: 0, offsetY: 0.65, scale: 2.6 },
    { name: "straw hat", path: "filters/Dont starve together/winter hat.png", offsetX: 0, offsetY: 0.65, scale: 2.6 },
    { name: "mũ đầu bếp", path: "filters/Mũ đầu bếp.png", offsetX: 0, offsetY: 0.65, scale: 2.8 },
    { name: "vòng hoa", path: "filters/vòng hoa.png", offsetX: 0, offsetY: 0.5, scale: 2.6 },
    { name: "T1 6 sao", path: "filters/T1 6 sao.png", offsetX: 0, offsetY: 2.9, scale: 1.0 },
    { name: "hat art 1", path: "filters/Oxygen not includ/hat art 1.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
    { name: "hat art 2", path: "filters/Oxygen not includ/hat art 2.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
    { name: "hat art 3", path: "filters/Oxygen not includ/hat art 3.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
    { name: "hat astronut 1", path: "filters/Oxygen not includ/hat astronut 1.png", offsetX: -0.1, offsetY: 0.25, scale: 2.7 },
    { name: "hat astronut 2", path: "filters/Oxygen not includ/hat astronut 2.png", offsetX: -0.1, offsetY: 0.25, scale: 2.7 },
    { name: "hat basekeeping 1", path: "filters/Oxygen not includ/hat basekeeping 1.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
    { name: "hat basekeeping 2", path: "filters/Oxygen not includ/hat basekeeping 2.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
    { name: "hat building 1", path: "filters/Oxygen not includ/hat building 1.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
    { name: "hat building 2", path: "filters/Oxygen not includ/hat building 2.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
    { name: "hat building 3", path: "filters/Oxygen not includ/hat building 3.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
    { name: "hat cooking 1", path: "filters/Oxygen not includ/hat cooking 1.png", offsetX: 0.05, offsetY: 0.8, scale: 2.1 },
    { name: "hat cooking 2", path: "filters/Oxygen not includ/hat cooking 2.png", offsetX: 0.05, offsetY: 0.8, scale: 2.1 },
    { name: "hat engineering", path: "filters/Oxygen not includ/hat cooking 3.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
    { name: "hat farming 1", path: "filters/Oxygen not includ/hat farming 1.png", offsetX: 0, offsetY: 0.85, scale: 2.75 },
    { name: "hat farming 2", path: "filters/Oxygen not includ/hat farming 2.png", offsetX: 0, offsetY: 0.85, scale: 2.75 },
    { name: "hat farming 3", path: "filters/Oxygen not includ/hat farming 3.png", offsetX: 0, offsetY: 0.85, scale: 2.7 },
    { name: "hat hauling 1", path: "filters/Oxygen not includ/hat hauling 1.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
    { name: "hat hauling 2", path: "filters/Oxygen not includ/hat hauling 2.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
    { name: "hat medicalaid 1", path: "filters/Oxygen not includ/hat medicalaid 1.png", offsetX: -0.05, offsetY: 0.6, scale: 2.3 },
    { name: "hat medicalaid 2", path: "filters/Oxygen not includ/hat medicalaid 2.png", offsetX: -0.05, offsetY: 0.6, scale: 2.3 },
    { name: "hat medicalaid 3", path: "filters/Oxygen not includ/hat medicalaid 3.png", offsetX: -0.05, offsetY: 0.6, scale: 2.3 },
    { name: "hat mining 1", path: "filters/Oxygen not includ/hat mining 1.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
    { name: "hat mining 2", path: "filters/Oxygen not includ/hat mining 2.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
    { name: "hat mining 3", path: "filters/Oxygen not includ/hat mining 3.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
    { name: "hat mining 4", path: "filters/Oxygen not includ/hat mining 4.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
     { name: "hat rancher 1", path: "filters/Oxygen not includ/hat rancher 1.png", offsetX: -0.05, offsetY: 0.85, scale: 2.7 },
    { name: "hat rancher 2", path: "filters/Oxygen not includ/hat rancher 2.png", offsetX: -0.05, offsetY: 0.885, scale: 2.7 },
     { name: "hat suit 1", path: "filters/Oxygen not includ/hat suit 1.png", offsetX: 0, offsetY: 0.6, scale: 2.35 },
    { name: "hat suit 2", path: "filters/Oxygen not includ/hat suit 2.png", offsetX: 0, offsetY: 0.6, scale: 2.35 },
     { name: "hat technical 1", path: "filters/Oxygen not includ/hat technical 1.png", offsetX: 0.05, offsetY: 0.85, scale: 2.3 },
    { name: "hat technical 2", path: "filters/Oxygen not includ/hat technical 2.png", offsetX: 0.05, offsetY: 0.85, scale: 2.3 },
  ];

  filters.forEach(f => {
    const img = new Image();
    img.src = f.path;
    filterImages[f.name] = { image: img, offsetX: f.offsetX, offsetY: f.offsetY, scale: f.scale || 1.0 };
    img.addEventListener('load', () => safeLog(`Filter loaded: ${f.name}`));
    img.addEventListener('error', () => safeErr(`Filter failed: ${f.name}`));
  });
}

//dialogues===================================================================//
function preloadDialogues() {
  const dialogues = [
    { name: "speech_bubble_1", path: "dialogues/speech_bubble_1.png" },
    { name: "speech_bubble_2", path: "dialogues/speech_bubble_2.png" },
    { name: "pixel_bubble_1", path: "dialogues/pixel_bubble_1.png" },
    { name: "pixel_bubble_2", path: "dialogues/pixel_bubble_2.png" }
  ];

  dialogues.forEach(d => {
    const img = new Image();
    img.src = d.path;
    dialogueImages[d.name] = img;
    img.addEventListener('load', () => safeLog(`Dialogue loaded: ${d.name}`));
    img.addEventListener('error', () => safeErr(`Dialogue failed: ${d.name}`));
  });
}

//Grains===================================================================//
function preloadGrains() {
  const grains = [
    { name: "oldfilm", path: "textures/Old Film.mp4" },
    { name: "dustandscratches", path: "textures/dustandscratches.mp4" },
    { name: "hardgrain", path: "textures/hardgrain.mp4" },
  ];

  grains.forEach(g => {
    const v = document.createElement('video');
    v.src = g.path;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.addEventListener('loadeddata', () => {
      safeLog(`Grain loaded: ${g.name}`);
      v.play().catch(() => {});
    });
    grainVideos[g.name] = v;
  });
}


//fonts===================================================================//
async function preloadFonts() {
  const fontsToLoad = ['32px FontTime', '32px FontPixel', '3px MyFont'];
  try {
    await Promise.all(fontsToLoad.map(f => document.fonts.load(f)));
    safeLog('Fonts loaded');
  } catch (err) {
    safeErr('Font loading failed:', err);
  }
}

//Preload assets========================================//
function preloadAll() {
  preloadThemes();
  preloadFilters();
  preloadDialogues();
  preloadGrains();
  preloadFonts();
}
preloadAll();

//Load face models======================================== //
async function loadFaceModels() {
  if (faceModelsLoaded) return true;
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
    faceModelsLoaded = true;
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
      faceModelsLoaded = true;
      safeLog('Face models loaded (CDN)');
      return true;
    } catch (cdnErr) {
      safeErr('Failed to load face models:', cdnErr);
      return false;
    }
  }
}

//Drawing helpers: grid, frame, theme==============================================//

function drawThemeOverlayTo(ctxRef) {
  if (currentTheme !== 'none' && themeImages[currentTheme]) {
    const img = themeImages[currentTheme];
    if (img.complete && img.naturalHeight > 0) {
      ctxRef.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }
}


//grains==========================================================================
function drawGrainOverlay() {
  if (currentGrain !== 'none' && grainVideos[currentGrain]) {
    const v = grainVideos[currentGrain];
    if (v.readyState >= v.HAVE_CURRENT_DATA) {
      overlayCtx.globalAlpha = grainOpacity;
      overlayCtx.drawImage(v, 0, 0, overlay.width, overlay.height);
      overlayCtx.globalAlpha = 1.0;
    }
  } else {
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  }
}

function drawGrainOnCanvas(context, x, y, width, height) {
  if (currentGrain !== 'none' && grainVideos[currentGrain]) {
    const v = grainVideos[currentGrain];
    if (v.readyState >= v.HAVE_CURRENT_DATA) {
      context.globalAlpha = grainOpacity;
      context.drawImage(v, x, y, width, height);
      context.globalAlpha = 1.0;
    }
  }
}

//DIAOLUE====================================================================================
function drawDialogueOnFace(detection) {
  if (!showDialogue || selectedDialogue === 'none' || !dialogueText.trim()) return;

  const currentDialogue = dialogueImages[selectedDialogue];
  if (!currentDialogue || !currentDialogue.complete) return;

  const landmarks = detection.landmarks;
  const nose = landmarks.getNose();
  
  const faceWidth = Math.abs(landmarks.getRightEye()[3].x - landmarks.getLeftEye()[0].x);
  const baseDialogueWidth = faceWidth * 1.5;
  const originalAspectRatio = currentDialogue.naturalWidth / currentDialogue.naturalHeight;
  const baseDialogueHeight = baseDialogueWidth / originalAspectRatio;

  const dialogueWidth = baseDialogueWidth * dialogueScale;
  const dialogueHeight = baseDialogueHeight * dialogueScale;

  let centerX, centerY;

  const baseOffsetX = baseDialogueWidth * 0.3; 
  const baseOffsetY = baseDialogueHeight * 0.3; 

  switch (dialoguePosition) {
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

  //vẽ ô thoại=======================================================
  overlayCtx.drawImage(
    currentDialogue,
    centerX - dialogueWidth / 2,
    centerY - dialogueHeight / 2,
    dialogueWidth,
    dialogueHeight
  );
  overlayCtx.drawImage(
    currentDialogue,
    centerX - dialogueWidth / 2,
    centerY - dialogueHeight / 2,
    dialogueWidth,
    dialogueHeight
  );

  //Vẽ lời thoại===================================================
  overlayCtx.save();
  overlayCtx.translate(overlay.width, 0);
  overlayCtx.scale(-1, 1);

  const flippedCenterX = overlay.width - centerX;
  
  overlayCtx.font = `${dialogueSize}px ${dialogueFont}`;
  overlayCtx.fillStyle = dialogueColor;
  overlayCtx.textAlign = 'center';
  overlayCtx.textBaseline = 'middle';
  
  const maxWidth = dialogueWidth * 0.8;
  const words = dialogueText.split(' ');
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

  const lineHeight = dialogueSize * 1.2;
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



//Vẽ lên camera===============================================================================
async function detectFacesLive() {
  if (selectedFilter === 'none' && (!showDialogue || selectedDialogue === 'none' || !dialogueText.trim())) {
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    drawGrainOverlay();
    drawTimestampOnVideo();
    animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  if (detectionInProgress) {
    animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  detectionInProgress = true;

  if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
  }

  try {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    drawGrainOverlay();

    if (detections && detections.length > 0) {
      if (selectedFilter !== 'none') {
        const currentFilter = filterImages[selectedFilter];
        if (currentFilter && currentFilter.image.complete) {
          detections.forEach(d => {
            const landmarks = d.landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const nose = landmarks.getNose();

            const baseFaceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
            const faceWidth = baseFaceWidth * (currentFilter.scale || 1.0);
            const img = currentFilter.image;
            const originalAspectRatio = img.naturalWidth / img.naturalHeight;
            const faceHeight = faceWidth / originalAspectRatio;

            const centerX = (leftEye[3].x + rightEye[0].x) / 2 - faceWidth * (currentFilter.offsetX || 0);
            const centerY = nose[0].y - faceHeight * (currentFilter.offsetY || 0);

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

      if (showDialogue && selectedDialogue !== 'none' && dialogueText.trim()) {
        detections.forEach(d => {
          drawDialogueOnFace(d);
        });
      }
    }

    drawTimestampOnVideo();

  } catch (err) {
    safeErr('Face detection error:', err);
  }

  detectionInProgress = false;
  animationFrameId = requestAnimationFrame(detectFacesLive);
}

async function initializeFilter() {
  if (!filterActive) {
    const ok = await loadFaceModels();
    if (!ok) return;
    filterActive = true;
  }

  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  detectFacesLive();
}

//TIMESTAMP======================================================================================


function formatTimestamp(date) {
  const DD = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const YYYY = date.getFullYear();
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  switch (timestampFormat) {
    case 'dd/mm/yyyy': return `${DD}/${MM}/${YYYY}`;
    case 'mm/dd/yyyy': return `${MM}/${DD}/${YYYY}`;
    case 'yyyy-mm-dd': return `${YYYY}-${MM}-${DD}`;
    case 'full': return `${DD}/${MM}/${YYYY} ${HH}:${mm}:${ss}`;
    case 'custom':
      if (!customTimestampFormat) return `${DD}/${MM}/${YYYY}`;
      return customTimestampFormat
        .replace('DD', DD).replace('MM', MM).replace('YYYY', YYYY)
        .replace('HH', HH).replace('mm', mm).replace('ss', ss);
    default: return `${DD}/${MM}/${YYYY}`;
  }
}


function drawTimestampOnVideo() {
  if (!showTimestamp) return;

  const now = new Date();
  const text = formatTimestamp(now);
  const fontFamily = document.fonts && document.fonts.check && document.fonts.check(`12px ${timestampFont}`) ? timestampFont : 'monospace';

    if (currentCanvasLayout === '1x1') {
    sidepadding = 100;
    bottomPadding = 50
    fontSize = timestampSize * 0.5;
  } else {
    sidepadding = 25;
    bottomPadding = 25
    fontSize = timestampSize;
  }
  let posX, posY, align;
  
  switch (timestampPosition) {
    case 'top-left':
      posX = overlay.width - sidepadding;
      posY = bottomPadding + fontSize; 
      align = 'right';
      break;
    case 'top-right':
      posX = sidepadding;
      posY = bottomPadding + fontSize; 
      align = 'left';
      break;
    case 'bottom-left':
      posX = overlay.width - sidepadding;
      posY = overlay.height - fontSize; 
      align = 'right';
      break;
    case 'bottom-right':
      posX = sidepadding;
      posY = overlay.height - fontSize;; 
      align = 'left';
      break;
    default:
      posX = sidepadding; 
      posY = overlay.height - bottomPadding; 
      align = 'left';
  }

  overlayCtx.save();
  overlayCtx.translate(overlay.width, 0);
  overlayCtx.scale(-1, 1);

  overlayCtx.font = `${timestampSize}px ${fontFamily}`;
  overlayCtx.fillStyle = timestampColor;
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

function drawTimestamp(context, x, y, width, height) {
  if (!showTimestamp) return;

  const now = new Date();
  const text = formatTimestamp(now);
  const fontFamily = document.fonts && document.fonts.check && document.fonts.check(`12px ${timestampFont}`) ? timestampFont : 'monospace';

  const padding = 20;
  let posX, posY, align;
  switch (timestampPosition) {
    case 'top-left':
      posX = width - padding; posY = padding + timestampSize; align = 'right';
      break;
    case 'top-right':
      posX = padding; posY = padding + timestampSize; align = 'left';
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
  if (currentCanvasLayout === '1x1') {
    context.translate(x, y);
    
    context.font = `${timestampSize}px ${fontFamily}`;
    context.fillStyle = timestampColor;
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

    context.font = `${timestampSize}px ${fontFamily}`;
    context.fillStyle = timestampColor;
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

//CONTROL====================================================================================
document.addEventListener('DOMContentLoaded', function() {
  timestampControls.style.display = 'none';
  dialogueControls.style.display = 'none';
  timestampToggle.checked = false;
  dialogueToggle.checked = false;
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

// Start capture
startBtn.addEventListener('click', startCapture);

// Frame color control===============================
frameColorPicker.addEventListener('input', (e) => {
  frameColor = e.target.value;
  drawGrid();
});

// Theme control===============================
themeSelected.addEventListener("click", (e) => {
  e.stopPropagation();
  themeSelect.classList.toggle("open");
});

themeOptions.forEach(opt => {
  opt.addEventListener("click", (e) => {
    const value = opt.dataset.value;
    themeSelected.textContent = opt.textContent;
    themeSelect.classList.remove("open");
    currentTheme = value;
    drawGrid();
  });
});

//SUbmenu=========================================================
themeSubOptions.forEach(opt => {
  opt.addEventListener("click", (e) => {
    e.stopPropagation();
    const value = opt.dataset.value;
    
    const parentText = opt.closest('.theme-parent').textContent.split('→')[0].trim();
    themeSelected.textContent = `${parentText} - ${opt.textContent}`;
    
    themeSelect.classList.remove("open");
    currentTheme = value;
    drawGrid();
  });
});

document.addEventListener("click", () => {
  themeSelect.classList.remove("open");
});

// Filter control===============================
filterSelected.addEventListener("click",(e)=>{
  e.stopPropagation();
  filterSelect.classList.toggle("open");
});

filterOptions.forEach(opt=>{
  opt.addEventListener("click",(e)=>{
    const value = opt.dataset.value;
    filterSelected.textContent = opt.textContent;
    filterSelect.classList.remove("open");
    selectedFilter=value;
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    selectedFilter==='none'?filterActive=false:initializeFilter();
  });
});

dstOptions.forEach(opt=>{
  opt.addEventListener("click",(e)=>{
    e.stopPropagation();
    const value = opt.dataset.value;
    filterSelected.textContent = opt.textContent;
    filterSelect.classList.remove("open");
    selectedFilter=value;
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    initializeFilter();
  });
});

document.addEventListener("click",()=>filterSelect.classList.remove("open"));

// Grain control=================================================
grainSelect.addEventListener('change', () => {
  currentGrain = grainSelect.value;

  Object.values(grainVideos).forEach(v => {
    try { v.pause(); v.currentTime = 0; } catch (e) {}
  });

  if (currentGrain !== 'none' && grainVideos[currentGrain]) {
    grainVideos[currentGrain].play().catch(() => {});
  }

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

// Grain opacity==================================================
grainOpacitySlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  grainOpacity = val / 100;
  grainOpacityValue.textContent = `${val}%`;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

//Timestamp control=======================================
timestampToggle.addEventListener('change', (e) => {
  showTimestamp = e.target.checked;
  timestampControls.style.display = showTimestamp ? 'block' : 'none';
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

timestampFormatSel.addEventListener('change', (e) => {
  timestampFormat = e.target.value;
  if (timestampFormat === 'custom') {
    customFormatGroup.style.display = 'flex';
  } else {
    customFormatGroup.style.display = 'none';
  }
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

timestampFontSel.addEventListener('change', (e) => { 
  timestampFont = e.target.value; 
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

timestampSizeInput.addEventListener('change', (e) => { 
  timestampSize = parseInt(e.target.value) || 16; 
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

if (timestampColorInput) timestampColorInput.addEventListener('input', (e) => { 
  timestampColor = e.target.value; 
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

timestampPositionSel.addEventListener('change', (e) => { 
  timestampPosition = e.target.value; 
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

customFormatInput.addEventListener('input', (e) => { 
  customTimestampFormat = e.target.value; 
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

///Dialogue control=============================================
const dialogueScaleInput = document.getElementById('dialogueScale');
const dialogueScaleValue = document.getElementById('dialogueScaleValue');

dialogueScaleInput.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  dialogueScale = val / 100;
  dialogueScaleValue.textContent = `${val}%`;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});
dialogueToggle.addEventListener('change', (e) => {
  showDialogue = e.target.checked;
  dialogueControls.style.display = showDialogue ? 'block' : 'none';
  
  if (showDialogue && !filterActive) {
    initializeFilter();
  } else {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    detectFacesLive();
  }
});

dialogueSelect.addEventListener('change', (e) => {
  selectedDialogue = e.target.value;
  if (showDialogue && selectedDialogue !== 'none' && !filterActive) {
    initializeFilter();
  } else {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    detectFacesLive();
  }
});
dialogueSelect.addEventListener('change', (e) => {
  selectedDialogue = e.target.value;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

dialogueTextInput.addEventListener('input', (e) => {
  dialogueText = e.target.value;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

dialogueFontSel.addEventListener('change', (e) => {
  dialogueFont = e.target.value;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

dialogueSizeInput.addEventListener('change', (e) => {
  dialogueSize = parseInt(e.target.value) || 16;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

dialogueColorInput.addEventListener('input', (e) => {
  dialogueColor = e.target.value;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

dialoguePositionSel.addEventListener('change', (e) => {
  dialoguePosition = e.target.value;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

function handleResize() {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    if (typeof faceapi !== 'undefined' && faceModelsLoaded) {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(overlay, displaySize);
    }
  }
}
video.addEventListener('loadedmetadata', handleResize);
window.addEventListener('resize', handleResize);
video.addEventListener('play', handleResize);

preloadFonts();
drawGrid();


//WEATHER==============================================================================//
let currentWeather = 'none';
let leafInterval = null;
let snowInterval = null;
let rainInterval = null;
let petalInterval = null;

const weatherParent = document.querySelector('.weather-parent');
const weatherSubmenu = document.querySelector('.weather-submenu');
const weatherOptions = weatherSubmenu.querySelectorAll('li');

weatherParent.addEventListener('click', (e) => {
  e.stopPropagation();
  weatherSubmenu.style.display = weatherSubmenu.style.display === 'block' ? 'none' : 'block';
});

weatherOptions.forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    currentWeather = opt.dataset.value;
    
    updateWeatherEffects();
    
    weatherSubmenu.style.display = 'none';
  });
});
document.addEventListener('click', () => {
  weatherSubmenu.style.display = 'none';
});

function updateWeatherEffects() {
  stopCreatingNewWeatherEffects();
    switch(currentWeather) {
    case 'none':
      break;
    case 'spring':
      createFlowerPetals();
      break;
    case 'summer':
      startRain();
      break;
    case 'autumn':
      startLeafFall();
      break;
    case 'winter':
      startSnowFall();
      break;
  }
  safeLog(`Weather changed to: ${currentWeather}`);
}

//Hoa đào======================================================================//
function createFlowerPetals() {
  petalInterval = setInterval(() => {
    if (currentWeather === 'spring') {
      createPetal();
    }
  }, Math.random() * 200 + 150);
}
function createPetal() {
  if (currentWeather !== 'spring') return;
  const petal = document.createElement('div');
  petal.classList.add('leaf');
  petal.innerHTML = '🌸';
  const size = Math.random() * 25 + 15;
  petal.style.fontSize = `${size}px`;
  petal.style.left = `${Math.random() * 100}vw`;
  const duration = Math.random() * 20 + 12;
  const sway = Math.random() * 80 - 40;

  petal.style.setProperty('--sway', `${sway}px`);
  petal.style.animation = `leaf-fall ${duration}s linear forwards`;
  petal.style.opacity = Math.random() * 0.6 + 0.4;
  
  document.body.appendChild(petal);
  setTimeout(() => {
    if (petal.parentNode) petal.remove();
  }, duration * 5000);
}

//Mưa=====================================================================//
function startRain() {
  createRaindrop();
  rainInterval = setInterval(() => {
    if (currentWeather === 'summer') {
      createRaindrop();
      if (Math.random() > 0.5) {
        setTimeout(() => createRaindrop(), 50);
      }
      if (Math.random() > 0.7) {
        setTimeout(() => createRaindrop(), 100);
      }
    }
  }, 10);
}
function createRaindrop() {
  if (currentWeather !== 'summer') return;
  const raindrop = document.createElement('div');
  raindrop.classList.add('raindrop');
  
  raindrop.style.width = '2px';
  raindrop.style.height = '20px';
  raindrop.style.background = 'linear-gradient(to bottom, transparent, #a0d0ff, #70b0ff)';
  raindrop.style.borderRadius = '1px';
  
  raindrop.style.left = `${Math.random() * 100}vw`;
  
  const duration = Math.random() * 0.8 + 0.4;
  raindrop.style.animation = `rain-fall ${duration}s linear forwards`;
  
  raindrop.style.opacity = Math.random() * 0.7 + 0.3;
  
  const length = Math.random() * 15 + 10;
  raindrop.style.height = `${length}px`;
  
  const width = Math.random() * 1 + 1;
  raindrop.style.width = `${width}px`;
  
  document.body.appendChild(raindrop);
  
  setTimeout(() => {
    if (raindrop.parentNode) {
      raindrop.remove();
    }
  }, duration * 1000);
}

//Leaf fall==========================================================//
function startLeafFall() {
  createLeaf();
  leafInterval = setInterval(() => {
    if (currentWeather === 'autumn') {
      createLeaf();
    }
  }, Math.random() * 150 + 100);
}
function createLeaf() {
  if (currentWeather !== 'autumn') return;
  const leaf = document.createElement('div');
  leaf.classList.add('leaf');
  
  const leaves = ['🍁', '🍂'];
  const randomLeaf = leaves[Math.floor(Math.random() * leaves.length)];
  leaf.innerHTML = randomLeaf;
  
  const size = Math.random() * 30 + 15;
  leaf.style.fontSize = `${size}px`;
  
  leaf.style.left = `${Math.random() * 100}vw`;
  
  const duration = Math.random() * 10 + 5;
  const sway = Math.random() * 100 - 50;
  
  leaf.style.setProperty('--sway', `${sway}px`);
  leaf.style.animation = `leaf-fall ${duration}s linear forwards`;
  
  leaf.style.opacity = Math.random() * 0.7 + 0.3;
  
  const colors = ['#ff6b35',
    '#f4a261',
    '#e76f51',
    '#e9c46a'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  leaf.style.color = randomColor;
  document.body.appendChild(leaf);

  setTimeout(() => {
    if (leaf.parentNode) {
      leaf.remove();
    }
  }, duration * 5000);
}

//Snow===============================================================================//
function startSnowFall() {
  createSnowflake();
  snowInterval = setInterval(() => {
    if (currentWeather === 'winter') {
      createSnowflake();
    }
  }, Math.random() * 100 + 75);
}

function createSnowflake() {
  if (currentWeather !== 'winter') return;
  const snowflake = document.createElement('div');
  snowflake.classList.add('snowflake');
  snowflake.innerHTML = '❄';
  
  const size = Math.random() * 20 + 10;
  snowflake.style.fontSize = `${size}px`;
  
  snowflake.style.left = `${Math.random() * 100}vw`;
  
  const duration = Math.random() * 8 + 5;
  snowflake.style.animation = `fall ${duration}s linear forwards`;
  
  snowflake.style.opacity = Math.random() * 0.8 + 0.2;
  
  const rotation = Math.random() * 360;
  snowflake.style.transform = `rotate(${rotation}deg)`;
  document.body.appendChild(snowflake);
  
  setTimeout(() => {
    if (snowflake.parentNode) {
      snowflake.remove();
    }
  }, duration * 4000);
}

function stopCreatingNewWeatherEffects() {
  if (leafInterval) {
    clearInterval(leafInterval);
    leafInterval = null;
  }
  
  if (snowInterval) {
    clearInterval(snowInterval);
    snowInterval = null;
  }
  
  if (rainInterval) {
    clearInterval(rainInterval);
    rainInterval = null;
  }
  
  if (petalInterval) {
    clearInterval(petalInterval);
    petalInterval = null;
  }
}

//================================================
document.addEventListener('DOMContentLoaded', function() {
  updateWeatherEffects();
});

//NHẠC=========================================================================================
let currentMusic = 'none';
let lyricsInterval = null;
let currentLyricIndex = 0;

const musicParent = document.querySelector('.music-parent');
const musicSubmenu = document.querySelector('.music-submenu');
const musicOptions = musicSubmenu.querySelectorAll('li');
const lyricsContainer = document.getElementById('lyricsContainer');
const lyricsText = document.getElementById('lyricsText');

// Nơi này có anh
const noiNayCoAnhLyrics = [
  { text: "Em là ai bước đến nơi đây dịu dàng chân phương", duration: 5000 },
  { text: "Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương", duration: 5000 },
  { text: "Ngắm em thật lâu", duration: 2500 },
  { text: "Con tim anh yếu mềm", duration: 2500 },
  { text: "Đắm say từ phút đó", duration: 2500 },
  { text: "Từng giây trôi yêu thêm", duration: 3500 },
  { text: "Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh", duration: 5000 },
  { text: "Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh", duration: 5000 },
  { text: "Liếc đôi hàng mi", duration: 3000 },
  { text: "Mong manh anh thẫn thờ", duration: 2900 },
  { text: "Muốn hôn nhẹ mái tóc", duration: 2000 },
  { text: "Bờ môi em anh mơ", duration: 2800 },
  { text: "Cầm tay anh dựa vai anh", duration: 2400 },
  { text: "Kề bên anh nơi này có anh", duration: 2400 },
  { text: "Gió mang câu tình ca", duration: 1900 },
  { text: "Ngàn ánh sao vụt qua nhẹ ôm lấy em", duration: 3500 },
  { text: "Cầm tay anh dựa vai anh", duration: 2400 },
  { text: "Kề bên anh nơi này có anh", duration: 2400 },
  { text: "Khép đôi mi thật lâu", duration: 2000 },
  { text: "Nguyện mãi bên cạnh nhau yêu say đắm như ngày đầu", duration: 4000 },
  { text: "Mùa xuân đến bình yên", duration: 2750 },
  { text: "Cho anh những giấc mơ", duration: 2600 },
  { text: "Hạ lưu giữ ngày mưa", duration: 2700 },
  { text: "Ngọt ngào nên thơ", duration: 2500 },
  { text: "Mùa thu lá vàng rơi", duration: 2700 },
  { text: "Đông sang anh nhớ em", duration: 2500 },
  { text: "Tình yêu bé nhỏ xin", duration: 2500 },
  { text: "Dành tặng riêng em", duration: 3000 },  
  { text: "𝅘𝅥𝅯 𝅘𝅥 𝅘𝅥𝅮 𝅘𝅥𝅯 𝅘𝅥 𝅘𝅥𝅮", duration: 6000 }, 
];


musicParent.addEventListener('click', (e) => {
  e.stopPropagation();
  musicSubmenu.style.display = musicSubmenu.style.display === 'block' ? 'none' : 'block';
});
musicOptions.forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMusic = opt.dataset.value;
    updateMusicEffects();   
    musicSubmenu.style.display = 'none';
  });
});


function updateMusicEffects() {
  stopCurrentMusic();
  switch(currentMusic) {
    case 'none':
      hideLyrics();
      break;
    case 'Nơi này có anh':
      showLyrics();
      startLyricsDisplay();
      break;
  }
  safeLog(`Music changed to: ${currentMusic}`);
}

function stopCurrentMusic() {
  if (lyricsInterval) {
    clearInterval(lyricsInterval);
    lyricsInterval = null;
  }
  currentLyricIndex = 0;
}

function showLyrics() {
  lyricsContainer.style.display = 'block';
  lyricsText.textContent = '';
  lyricsText.classList.remove('show');
}

function hideLyrics() {
  lyricsContainer.style.display = 'none';
  lyricsText.classList.remove('show');
}

function startLyricsDisplay() {
  if (currentMusic !== 'Nơi này có anh') return;
  currentLyricIndex = 0;
  displayNextLyric();
}

function displayNextLyric() {
  if (currentMusic !== 'Nơi này có anh') return;
  
  if (currentLyricIndex >= noiNayCoAnhLyrics.length) {
    currentLyricIndex = 0; 
  }
  
  const currentLyric = noiNayCoAnhLyrics[currentLyricIndex];
  
  lyricsText.classList.remove('show');
  
  setTimeout(() => {
    lyricsText.textContent = currentLyric.text;
    lyricsText.classList.add('show');
    
    currentLyricIndex++;
    
    if (currentLyricIndex < noiNayCoAnhLyrics.length || currentMusic === 'Nơi này có anh') {
      const nextLyric = noiNayCoAnhLyrics[currentLyricIndex];
      const displayTime = currentLyric.duration;
      
      lyricsInterval = setTimeout(() => {
        displayNextLyric();
      }, displayTime);
    }
  }, 0)
}
//================================================================================================
document.addEventListener('DOMContentLoaded', function() {
  updateMusicEffects();
});

document.addEventListener('DOMContentLoaded', function() {
  updateCanvasLayout('3x2');
});
document.addEventListener('click', () => {
  musicSubmenu.style.display = 'none';
});



//CHỤP ẢNH==================================================================
function captureFrame(index) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = leftside + col * frameW;
  const y = row * frameH;

  ctx.save();
  
  ctx.translate(x + frameW, y);
  ctx.scale(-1, 1);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, frameW, frameH);

  const videoAspect = video.videoWidth / video.videoHeight;
  const frameAspect = frameW / frameH;
  
  let drawWidth, drawHeight, offsetX, offsetY;
  let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight;

  if (frameAspect > videoAspect) {
    drawWidth = frameW;
    drawHeight = frameW / videoAspect;
    offsetX = 0;
    offsetY = (frameH - drawHeight) / 2;
    
    const cropHeight = video.videoWidth / frameAspect;
    sourceY = (video.videoHeight - cropHeight) / 2;
    sourceHeight = cropHeight;
  } else {
    drawHeight = frameH;
    drawWidth = frameH * videoAspect;
    offsetX = (frameW - drawWidth) / 2;
    offsetY = 0;
    
    const cropWidth = video.videoHeight * frameAspect;
    sourceX = (video.videoWidth - cropWidth) / 2;
    sourceWidth = cropWidth;
  }

  ctx.drawImage(
    video,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, frameW, frameH 
  );

  if (overlay.width > 0 && overlay.height > 0) {
    const overlaySourceX = (overlay.width / video.videoWidth) * sourceX;
    const overlaySourceY = (overlay.height / video.videoHeight) * sourceY;
    const overlaySourceWidth = (overlay.width / video.videoWidth) * sourceWidth;
    const overlaySourceHeight = (overlay.height / video.videoHeight) * sourceHeight;
    
    ctx.drawImage(
      overlay,
      overlaySourceX, overlaySourceY, overlaySourceWidth, overlaySourceHeight, 
      0, 0, frameW, frameH
    );
  }

  drawGrainOnCanvas(ctx, 0, 0, frameW, frameH);
  drawTimestamp(ctx, 0, 0, frameW, frameH);

  ctx.restore();

  if (showGrid) {
    redrawGridLines();
  } else {
    drawThemeOverlayTo(ctx);
  }
}


//Vẽ lại viền 
function redrawGridLines() {
  if (!showGrid) return;

  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 20;
  if (cols > 1) {
    for (let i = 1; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo(leftside + i * frameW, 0);
      ctx.lineTo(leftside + i * frameW, canvasHeight);
      ctx.stroke();
    }
  }
  
  if (rows > 1) {
    for (let i = 1; i < rows; i++) {
      ctx.beginPath();
      ctx.moveTo(leftside, i * frameH);
      ctx.lineTo(canvasWidth - rightside, i * frameH);
      ctx.stroke();
    }
  }
  
  drawOuterFrameTo(ctx);
  drawThemeOverlayTo(ctx);
}
function startCapture() {
  startBtn.style.display = 'none';
  statusText.style.display = 'block';
  drawGrid();

  let count = 0;
  let timeLeft = Math.max(1, parseInt(countdownInput.value) || 5);

  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      captureFrame(count);
      count++;
      if (count >= cols * rows) {
        clearInterval(timer);
        statusText.textContent = 'Tada!!!';
        setTimeout(() => {
          startBtn.style.display = 'block';
          statusText.style.display = 'none';
        }, 3000);

        const link = document.createElement('a');
        link.download = 'photo_strip.png';
        link.href = canvas.toDataURL();
        link.click();
        return;
      }
      timeLeft = Math.max(1, parseInt(countdownInput.value) || 5);
    }
    statusText.textContent = `Ảnh ${count + 1}/${cols * rows} chụp sau ${timeLeft--}s`;
  }, 1000);
}
const canvasLayoutSelect = document.getElementById('canvasLayout');

canvasLayoutSelect.addEventListener('change', (e) => {
  updateCanvasLayout(e.target.value);
});


gridToggle.addEventListener('change', (e) => {
  showGrid = e.target.checked;
  drawGrid(); 
});