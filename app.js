/* app.js — cleaned & modular version
   Preserves original behavior:
   - Camera preview + overlay (filters drawn via face-api)
   - Grain overlay (video textures)
   - Preload fonts, themes, filters, grains
   - Capture 6 frames into a 3x2 canvas photo strip with timestamp
   - Controls: frame color, theme, filter, grain, grain opacity, timestamp options, countdown
*/

/* ===========================
   Element references
   =========================== */
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const overlayCtx = overlay.getContext('2d');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('start');
const statusText = document.getElementById('status');

const frameColorPicker = document.getElementById('frameColor');
const countdownInput = document.getElementById('countdownTime');
const themeSelect = document.getElementById('themeSelect');
const grainSelect = document.getElementById('grainSelect');
const grainOpacitySlider = document.getElementById('grainOpacity');
const grainOpacityValue = document.getElementById('grainOpacityValue');

const timestampControls = document.getElementById('timestampControls');
/* timestamp controls exist in DOM with ids used below */
const timestampToggle = document.getElementById('timestampToggle');
const timestampFormatSel = document.getElementById('timestampFormat');
const timestampFontSel = document.getElementById('timestampFont');
const timestampSizeInput = document.getElementById('timestampSize');
const timestampColorInput = document.getElementById('timestampColor') || null; // optional in DOM
const timestampPositionSel = document.getElementById('timestampPosition');
const customFormatInput = document.getElementById('customFormat');
const customFormatGroup = document.getElementById('customFormatGroup');
const filterSelect = document.getElementById('filterSelect');
const filterSelected = filterSelect.querySelector('.selected');
const filterOptions = filterSelect.querySelectorAll('.select-menu > li:not(.dst-parent)');
const dstOptions = filterSelect.querySelectorAll('.dst-submenu li');


/* ===========================
   App state
   =========================== */
let frameColor = '#4f6d8f';
let currentTheme = 'none';
let selectedFilter = 'none';
let filterActive = false;

let themeImages = {};   // { name: Image }
let filterImages = {};  // { name: { image, offsetX, offsetY, scale } }

let grainVideos = {};   // { name: HTMLVideoElement }
let currentGrain = 'none';
let grainOpacity = 0.25;

let detectionInProgress = false;
let animationFrameId = null;
let faceModelsLoaded = false;

/* Canvas grid layout (3 rows x 2 cols) */
const rows = 3;
const cols = 2;
const bottomPadding = 100;
const frameW = canvas.width / cols;
const frameH = (canvas.height - bottomPadding) / rows;

/* Timestamp state */
let showTimestamp = true;
let timestampFormat = 'dd/mm/yyyy';
let timestampFont = 'FontTime';
let timestampSize = 16;
let timestampColor = '#ffffff';
let timestampPosition = 'bottom-right';
let customTimestampFormat = '';

/* ===========================
   Utilities
   =========================== */
const $ = id => document.getElementById(id);

function safeLog(...args) { console.log(...args); }
function safeErr(...args) { console.error(...args); }

/* ===========================
   Camera setup
   =========================== */
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    safeErr('Cannot access camera:', err);
  }
}
startCamera();

/* ===========================
   Preloaders: themes, filters, grains, fonts
   =========================== */
function preloadThemes() {
  const themes = ['Đi làm', 'Danisa','Dont starve together 1'];
  themes.forEach(name => {
    const img = new Image();
    img.src = `themes/${name}.png`;
    themeImages[name] = img;
    img.addEventListener('load', () => safeLog(`Theme loaded: ${name}`));
  });
}

function preloadFilters() {
  const filters = [
    { name: "flower wreath", path: "filters/Don't starve together/flower wreath.png", offsetX: 0, offsetY: 0.5, scale: 2.3 },
    { name: "cylinder", path: "filters/Don't starve together/cylinder.png", offsetX: 0, offsetY: 0.7, scale: 2.7 },
    { name: "buffalo hat", path: "filters/Don't starve together/buffalo hat.png", offsetX: 0, offsetY: 0.6, scale: 3.6 },
    { name: "winter hat", path: "filters/Don't starve together/winter hat.png", offsetX: 0, offsetY: 0.65, scale: 2.6 },
    { name: "straw hat", path: "filters/Don't starve together/winter hat.png", offsetX: 0, offsetY: 0.65, scale: 2.6 },
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
      v.play().catch(() => {}); // autoplay may be blocked until user interacts
    });
    grainVideos[g.name] = v;
  });
}

async function preloadFonts() {
  const fontsToLoad = ['16px FontTime', '20px FontTime'];
  try {
    await Promise.all(fontsToLoad.map(f => document.fonts.load(f)));
    safeLog('Fonts loaded');
  } catch (err) {
    safeErr('Font loading failed:', err);
  }
}

/* Single entrypoint to preload assets */
function preloadAll() {
  preloadThemes();
  preloadFilters();
  preloadGrains();
  preloadFonts();
}
preloadAll();

/* ===========================
   Face-api model loader (with CDN fallback)
   =========================== */
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
      statusText.textContent = '❌ Lỗi tải mô hình nhận diện';
      return false;
    }
  }
}

/* ===========================
   Drawing helpers: grid, frame, theme
   =========================== */

function drawOuterFrameTo(ctxRef) {
  const outerLineWidth = 10;
  const bottomLineWidth = 100;
  const topLineWidth = 10;

  ctxRef.strokeStyle = frameColor;

  // Outer rectangles (left and right lines)
  ctxRef.lineWidth = outerLineWidth;
  ctxRef.beginPath();
  ctxRef.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(canvas.width - outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(outerLineWidth / 2, canvas.height - outerLineWidth / 2);
  ctxRef.moveTo(canvas.width - outerLineWidth / 2, outerLineWidth / 2);
  ctxRef.lineTo(canvas.width - outerLineWidth / 2, canvas.height - outerLineWidth / 2);
  ctxRef.stroke();

  // Bottom thick line
  ctxRef.lineWidth = bottomLineWidth;
  ctxRef.beginPath();
  ctxRef.moveTo(0, canvas.height - bottomLineWidth / 2);
  ctxRef.lineTo(canvas.width, canvas.height - bottomLineWidth / 2);
  ctxRef.stroke();

  // Top thin line
  ctxRef.lineWidth = topLineWidth;
  ctxRef.beginPath();
  ctxRef.moveTo(0, topLineWidth / 2);
  ctxRef.lineTo(canvas.width, topLineWidth / 2);
  ctxRef.stroke();
}

function drawThemeOverlayTo(ctxRef) {
  if (currentTheme !== 'none' && themeImages[currentTheme]) {
    const img = themeImages[currentTheme];
    if (img.complete && img.naturalHeight > 0) {
      ctxRef.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }
}

function drawGrid() {
  // base background
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // main strokes
  ctx.strokeStyle = frameColor;
  drawOuterFrameTo(ctx);

  const innerLineWidth = 10;
  ctx.lineWidth = innerLineWidth;

  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * frameW, 0);
    ctx.lineTo(i * frameW, canvas.height);
    ctx.stroke();
  }
  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * frameH);
    ctx.lineTo(canvas.width, i * frameH);
    ctx.stroke();
  }

  drawThemeOverlayTo(ctx);
}

/* ===========================
   Grain overlay (video) helpers
   =========================== */
function drawGrainOverlay() {
  if (currentGrain !== 'none' && grainVideos[currentGrain]) {
    const v = grainVideos[currentGrain];
    if (v.readyState >= v.HAVE_CURRENT_DATA) {
      overlayCtx.globalAlpha = grainOpacity;
      overlayCtx.drawImage(v, 0, 0, overlay.width, overlay.height);
      overlayCtx.globalAlpha = 1.0;
    }
  } else {
    // ensure overlay cleared if none selected
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

/* ===========================
   Face detection & filter rendering loop
   =========================== */

async function detectFacesLive() {
  // If no filter chosen, just draw grain (if any) and loop
  if (selectedFilter === 'none') {
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    drawGrainOverlay(); 
    animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  if (detectionInProgress) {
    animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  detectionInProgress = true;

  // keep overlay same size as video
  if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
  }

  try {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    // draw grain first
    drawGrainOverlay();

    if (detections && detections.length > 0 && selectedFilter !== 'none') {
      const currentFilter = filterImages[selectedFilter];
      if (currentFilter && currentFilter.image.complete) {
        detections.forEach(d => {
          const landmarks = d.landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          // base face width estimation using eyes
          const baseFaceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
          const faceWidth = baseFaceWidth * (currentFilter.scale || 1.0);
          // Tự động giữ tỷ lệ ảnh gốc
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
  } catch (err) {
    safeErr('Face detection error:', err);
  }

  detectionInProgress = false;
  animationFrameId = requestAnimationFrame(detectFacesLive);
}

/* Initialize filter (loads models once and starts detection loop) */
async function initializeFilter() {
  if (!filterActive) {
    const ok = await loadFaceModels();
    if (!ok) return;
    filterActive = true;
  }

  // reset overlay then start loop
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  detectFacesLive();
}

/* ===========================
   Capture logic (3x2 photo strip)
   =========================== */

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

function drawTimestamp(context, x, y, width, height) {
  if (!showTimestamp) return;

  const now = new Date();
  const text = formatTimestamp(now);

  // fallback font family check
  const fontFamily = document.fonts && document.fonts.check && document.fonts.check(`12px ${timestampFont}`) ? timestampFont : 'monospace';

  // compute position (account for flip applied during capture)
  const padding = 10;
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
  // flip horizontally so text appears correct after canvas horizontal flip
  context.translate(width, 0);
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
  context.restore();
}

function captureFrame(index) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * frameW;
  const y = row * frameH;

  ctx.save();
  // flip capture area horizontally to mirror selfie like video preview
  ctx.translate(x + frameW, y);
  ctx.scale(-1, 1);

  // draw video scaled into frame
  ctx.drawImage(video, 0, 0, frameW, frameH);

  // draw overlay scaled correctly (overlay is same natural size as video)
  ctx.drawImage(overlay, 0, 0, video.videoWidth, video.videoHeight, 0, 0, frameW, frameH);

  // draw grain on this frame
  drawGrainOnCanvas(ctx, 0, 0, frameW, frameH);

  // draw timestamp for this frame
  drawTimestamp(ctx, 0, 0, frameW, frameH);

  ctx.restore();

  // redraw grid lines and theme on top (consistent with original)
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 10;
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * frameW, 0);
    ctx.lineTo(i * frameW, canvas.height);
    ctx.stroke();
  }
  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * frameH);
    ctx.lineTo(canvas.width, i * frameH);
    ctx.stroke();
  }
  drawOuterFrameTo(ctx);
  drawThemeOverlayTo(ctx);
}

/* ===========================
   Capture flow (6 frames)
   =========================== */
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

        // trigger download
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

/* ===========================
   Event listeners
   =========================== */

// Start capture
startBtn.addEventListener('click', startCapture);

// Frame color
frameColorPicker.addEventListener('input', (e) => {
  frameColor = e.target.value;
  drawGrid();
});

// Theme change
themeSelect.addEventListener('change', (e) => {
  currentTheme = e.target.value;
  drawGrid();
});

// Filter change
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

// Grain change
grainSelect.addEventListener('change', () => {
  currentGrain = grainSelect.value;

  // pause all grains and start only selected
  Object.values(grainVideos).forEach(v => {
    try { v.pause(); v.currentTime = 0; } catch (e) {}
  });

  if (currentGrain !== 'none' && grainVideos[currentGrain]) {
    grainVideos[currentGrain].play().catch(() => {});
  }

  // force detection refresh if running
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

// Grain opacity
grainOpacitySlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  grainOpacity = val / 100;
  grainOpacityValue.textContent = `${val}%`;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  detectFacesLive();
});

/* Timestamp controls */
timestampToggle.addEventListener('change', (e) => {
  showTimestamp = e.target.checked;
  timestampControls.style.display = showTimestamp ? 'block' : 'none';
});

timestampFormatSel.addEventListener('change', (e) => {
  timestampFormat = e.target.value;
  if (timestampFormat === 'custom') {
    customFormatGroup.style.display = 'flex';
  } else {
    customFormatGroup.style.display = 'none';
  }
});

timestampFontSel.addEventListener('change', (e) => { timestampFont = e.target.value; });
timestampSizeInput.addEventListener('change', (e) => { timestampSize = parseInt(e.target.value) || 16; });
if (timestampColorInput) timestampColorInput.addEventListener('input', (e) => { timestampColor = e.target.value; });
timestampPositionSel.addEventListener('change', (e) => { timestampPosition = e.target.value; });
customFormatInput.addEventListener('input', (e) => { customTimestampFormat = e.target.value; });

/* Resize handlers */
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

/* Preload fonts at start (one call) */
preloadFonts();

/* Initial grid draw */
drawGrid();
