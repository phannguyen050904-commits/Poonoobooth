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
const filterSelect = document.getElementById('filterSelect');

let frameColor = "#4f6d8f";
let currentTheme = "none";
let selectedFilter = "none";
let filterActive = false;
let themeImages = {};
let filterImages = {};
let detectionInProgress = false;
let animationFrameId = null;

const rows = 3, cols = 2;
const bottomPadding = 100;
const frameW = canvas.width / cols;
const frameH = (canvas.height - bottomPadding) / rows;

// --- Mở camera ---
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Không mở được camera:", err));

// --- Preload themes và filters ---
function preloadAssets() {
  // Preload themes
  const themes = ['Đi làm', 'Danisa'];
  themes.forEach(theme => {
    const img = new Image();
    img.src = `themes/${theme}.png`;
    themeImages[theme] = img;
  });

  // Preload filters
  const filters = [
    { name: "flower wreath", path: "filters/flower wreath.png", offsetX:0, offsetY:0.5, scale:2.3 },
    { name: "cylinder", path: "filters/cylinder.png", offsetX:0, offsetY:0.7, scale:2.7 },
    { name: "buffalo hat", path: "filters/buffalo hat.png", offsetX:0, offsetY:0.6, scale:3.6 },
    { name: "winter hat", path: "filters/winter hat.png", offsetX:0, offsetY:0.65, scale:2.6 },
    { name: "mũ đầu bếp", path: "filters/Mũ đầu bếp.png", offsetX:0, offsetY:0.65, scale:2.8 },
    { name: "vòng hoa", path: "filters/vòng hoa.png", offsetX:0, offsetY:0.5, scale:2.6 },

    { name: "T1 6 sao", path: "filters/T1 6 sao.png", offsetX:0, offsetY: 2.9 }
  ];

  filters.forEach(filter => {
    const img = new Image();
    img.src = filter.path;
    img.onload = () => {
      console.log(`✅ Filter ${filter.name} loaded`);
    };
    filterImages[filter.name] = {
      image: img,
      offsetY: filter.offsetY,
      offsetX: filter.offsetX,
      scale: filter.scale || 1.0
    };
  });
}
preloadAssets();

// --- Vẽ khung viền ---
function drawOuterFrame() {
  const outerLineWidth = 10;
  const bottomLineWidth = 100;
  const topLineWidth = 10;
  ctx.strokeStyle = frameColor;

  ctx.lineWidth = outerLineWidth;
  ctx.beginPath();
  ctx.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctx.lineTo(canvas.width - outerLineWidth / 2, outerLineWidth / 2);
  ctx.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctx.lineTo(outerLineWidth / 2, canvas.height - outerLineWidth / 2);
  ctx.moveTo(canvas.width - outerLineWidth / 2, outerLineWidth / 2);
  ctx.lineTo(canvas.width - outerLineWidth / 2, canvas.height - outerLineWidth / 2);
  ctx.stroke();

  ctx.lineWidth = bottomLineWidth;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - bottomLineWidth / 2);
  ctx.lineTo(canvas.width, canvas.height - bottomLineWidth / 2);
  ctx.stroke();
  
  ctx.lineWidth = topLineWidth;
  ctx.beginPath();
  ctx.moveTo(0, topLineWidth / 2);
  ctx.lineTo(canvas.width, topLineWidth / 2);
  ctx.stroke();
}

// --- Vẽ theme overlay ---
function drawThemeOverlay() {
  if (currentTheme !== "none" && themeImages[currentTheme]) {
    const img = themeImages[currentTheme];
    if (img.complete && img.naturalHeight !== 0) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }
}

// --- Vẽ lưới ---
function drawGrid() {
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = frameColor;

  drawOuterFrame();

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

  drawThemeOverlay();
}
drawGrid();

// --- Đổi màu viền ---
frameColorPicker.addEventListener("input", () => {
  frameColor = frameColorPicker.value;
  drawGrid();
});

// --- Đổi theme ---
themeSelect.addEventListener("change", () => {
  currentTheme = themeSelect.value;
  drawGrid();
});

// --- Tải mô hình nhận diện ---
async function loadFaceModels() {
  try {
    console.log("🔄 Đang tải mô hình nhận diện...");
    
    if (typeof faceapi === 'undefined') {
      throw new Error("face-api.js chưa được tải");
    }

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    
    console.log("✅ Face models loaded");
    return true;
  } catch (error) {
    console.error("❌ Lỗi tải models:", error);
    
    try {
      console.log("🔄 Thử tải từ CDN...");
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
      await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
      await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
      await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
      
      console.log("✅ Models loaded from CDN");
      return true;
    } catch (cdnError) {
      console.error("❌ Lỗi tải từ CDN:", cdnError);
      statusText.textContent = "❌ Lỗi tải mô hình nhận diện";
      return false;
    }
  }
}

// --- Hiển thị filter trực tiếp ---
async function detectFacesLive() {
  if (selectedFilter === "none") {
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    drawGrainOverlay(); // ✅ Đảm bảo grain được vẽ ngay cả khi không có filter
    animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  if (detectionInProgress) {
    animationFrameId = requestAnimationFrame(detectFacesLive);
    return;
  }

  detectionInProgress = true;

  // Đảm bảo overlay có cùng kích thước với video
  if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
  }

  try {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    // Vẽ grain overlay TRƯỚC khi vẽ filter
    drawGrainOverlay();

    if (detections.length > 0 && selectedFilter !== "none") {
      const currentFilter = filterImages[selectedFilter];
      
      if (currentFilter && currentFilter.image.complete) {
        detections.forEach(d => {
          const landmarks = d.landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          const baseFaceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
          const faceWidth = baseFaceWidth * (currentFilter.scale || 1.0); // Áp dụng scale
          const faceHeight = faceWidth * 1; // Giữ tỉ lệ

          const centerX = (leftEye[3].x + rightEye[0].x) / 2 - faceWidth * currentFilter.offsetX;
          const centerY = nose[0].y - faceHeight * currentFilter.offsetY;

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
  } catch (error) {
    console.error("Lỗi face detection:", error);
  }

  detectionInProgress = false;
  animationFrameId = requestAnimationFrame(detectFacesLive);
}

// --- Xử lý đổi filter ---
filterSelect.addEventListener("change", async () => {
  // Dừng animation frame trước đó
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  selectedFilter = filterSelect.value;

  if (selectedFilter === "none") {
    filterActive = false;
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    return;
  }

  // Kiểm tra filter đã được tải chưa
  const currentFilter = filterImages[selectedFilter];
  if (!currentFilter || !currentFilter.image.complete) {
    console.log(`⏳ Filter ${selectedFilter} chưa sẵn sàng, vui lòng chờ...`);
    statusText.textContent = `Đang tải filter ${selectedFilter}...`;
    statusText.style.display = "block";
    
    currentFilter.image.onload = () => {
      statusText.style.display = "none";
      initializeFilter();
    };
    return;
  }

  await initializeFilter();
});

async function initializeFilter() {
  if (!filterActive) {
    const modelsLoaded = await loadFaceModels();
    if (!modelsLoaded) return;
    filterActive = true;
  }

  // Reset overlay
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  
  // Bắt đầu detection
  detectFacesLive();
}

// --- Chụp ảnh ---
function captureFrame(index) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * frameW;
  const y = row * frameH;

  ctx.save();
  ctx.translate(x + frameW, y);
  ctx.scale(-1, 1);

  // Tính tỉ lệ scale để vẽ video + overlay lên canvas
  const scaleX = frameW / video.videoWidth;
  const scaleY = frameH / video.videoHeight;
  
  // Vẽ video
  ctx.drawImage(video, 0, 0, frameW, frameH);
  
  // Vẽ overlay với scaling chính xác
  ctx.drawImage(overlay, 0, 0, video.videoWidth, video.videoHeight, 0, 0, frameW, frameH);
  
  // Vẽ grain với opacity hiện tại
  drawGrainOnCanvas(ctx, 0, 0, frameW, frameH);

  ctx.restore();

  // Vẽ grid và frame
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
  drawOuterFrame();
  drawThemeOverlay();
}

function startCapture() {
  startBtn.style.display = "none";
  statusText.style.display = "block";
  drawGrid();

  let count = 0;
  let timeLeft = parseInt(countdownInput.value);

  const timer = setInterval(() => {
    if (timeLeft === 0) {
      captureFrame(count);
      count++;

      if (count >= 6) {
        clearInterval(timer);
        statusText.textContent = "Tada!!!";
        setTimeout(() => {
          startBtn.style.display = "block";
          statusText.style.display = "none";
        }, 3000);

        const link = document.createElement('a');
        link.download = 'photo_strip.png';
        link.href = canvas.toDataURL();
        link.click();
        return;
      }
      timeLeft = parseInt(countdownInput.value);
    }
    statusText.textContent = `Ảnh ${count + 1}/6 chụp sau ${timeLeft--}s`;
  }, 1000);
}

startBtn.addEventListener('click', startCapture);

// --- Xử lý resize ---
function handleResize() {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    
    if (typeof faceapi !== 'undefined') {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(overlay, displaySize);
    }
  }
}

video.addEventListener('loadedmetadata', handleResize);
window.addEventListener('resize', handleResize);
video.addEventListener('play', handleResize);

// --- Film Grain Video Overlay ---
const grainSelect = document.getElementById("grainSelect");
let currentGrain = "none";
let grainVideos = {};

// Thêm biến toàn cục
let grainOpacity = 0.25; // Mặc định 25%

// Thêm sau phần khai báo grainSelect
const grainOpacitySlider = document.getElementById('grainOpacity');
const grainOpacityValue = document.getElementById('grainOpacityValue');

// Preload video grains
function preloadGrains() {
  const grains = [
    { name: "oldfilm", path: "textures/Old Film.mp4" },
    { name: "dustandscratches", path: "textures/dustandscratches.mp4" },
    { name: "hardgrain", path: "textures/hardgrain.mp4" },
  ];
  
  grains.forEach(g => {
    const video = document.createElement('video');
    video.src = g.path;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('loadeddata', () => {
      console.log(`✅ Video grain ${g.name} loaded`);
      video.play().catch(e => console.log(`Cannot autoplay ${g.name}:`, e));
    });
    
    grainVideos[g.name] = video;
  });
}
preloadGrains();

grainSelect.addEventListener("change", () => {
  currentGrain = grainSelect.value;
  
  // Dừng tất cả video trước khi chuyển đổi
  Object.values(grainVideos).forEach(video => {
    video.pause();
    video.currentTime = 0;
  });
  
  // Bắt đầu video mới nếu được chọn
  if (currentGrain !== "none" && grainVideos[currentGrain]) {
    grainVideos[currentGrain].play().catch(e => 
      console.log(`Cannot play ${currentGrain}:`, e)
    );
  }
  
  // Force redraw khi đổi grain
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  detectFacesLive();
});

// Xử lý sự kiện change cho opacity slider
grainOpacitySlider.addEventListener('input', (e) => {
  const opacityPercent = parseInt(e.target.value);
  grainOpacity = opacityPercent / 100;
  grainOpacityValue.textContent = `${opacityPercent}%`;
  
  // Cập nhật ngay lập tức
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  detectFacesLive();
});

// --- Áp dụng video grain trong video overlay ---
function drawGrainOverlay() {
  if (currentGrain !== "none" && grainVideos[currentGrain]) {
    const video = grainVideos[currentGrain];
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      overlayCtx.globalAlpha = grainOpacity;
      overlayCtx.drawImage(video, 0, 0, overlay.width, overlay.height);
      overlayCtx.globalAlpha = 1.0;
    }
  }
}

// --- Vẽ video grain lên canvas khi chụp ảnh ---
function drawGrainOnCanvas(context, x, y, width, height) {
  if (currentGrain !== "none" && grainVideos[currentGrain]) {
    const video = grainVideos[currentGrain];
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      context.globalAlpha = grainOpacity;
      context.drawImage(video, x, y, width, height);
      context.globalAlpha = 1.0;
    }
  }
}

// Thêm các biến timestamp (sau các biến khác)
let showTimestamp = true;
let timestampFormat = "dd/mm/yyyy";
let timestampFont = "FontTime";
let timestampSize = 16;
let timestampColor = "#ffffff";
let timestampPosition = "bottom-right";
let customTimestampFormat = "";

// Thêm event listeners cho các controls timestamp (sau các event listeners khác)
// Thêm biến mới (sau các biến timestamp khác)
const timestampControls = document.getElementById('timestampControls');

// Cập nhật event listener cho timestamp toggle
document.getElementById('timestampToggle').addEventListener('change', (e) => {
  showTimestamp = e.target.checked;
  
  // Hiện/ẩn container controls timestamp
  if (showTimestamp) {
    timestampControls.style.display = 'block';
  } else {
    timestampControls.style.display = 'none';
  }
});

// Giữ nguyên các event listeners khác cho timestamp
document.getElementById('timestampFormat').addEventListener('change', (e) => {
  timestampFormat = e.target.value;
  if (timestampFormat === 'custom') {
    document.getElementById('customFormatGroup').style.display = 'flex';
  } else {
    document.getElementById('customFormatGroup').style.display = 'none';
  }
});

document.getElementById('timestampFont').addEventListener('change', (e) => {
  timestampFont = e.target.value;
});

document.getElementById('timestampSize').addEventListener('change', (e) => {
  timestampSize = parseInt(e.target.value);
});

document.getElementById('timestampColor').addEventListener('input', (e) => {
  timestampColor = e.target.value;
});

document.getElementById('timestampPosition').addEventListener('change', (e) => {
  timestampPosition = e.target.value;
});

document.getElementById('customFormat').addEventListener('input', (e) => {
  customTimestampFormat = e.target.value;
});

// Xóa phần timestamp panel cũ (nếu có)
// Xóa các dòng về timestampPanelVisible và timestampPanel

// Thêm code để khởi tạo trạng thái ban đầu
window.addEventListener('load', () => {
  // Ẩn timestamp controls mặc định nếu không được tích chọn
  if (!showTimestamp) {
    timestampControls.style.display = 'none';
  }
});
// ... (giữ nguyên phần còn lại của file)

// Hàm format thời gian
function formatTimestamp(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  switch (timestampFormat) {
    case 'dd/mm/yyyy':
      return `${day}/${month}/${year}`;
    case 'mm/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-mm-dd':
      return `${year}-${month}-${day}`;
    case 'full':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case 'custom':
      if (!customTimestampFormat) return `${day}/${month}/${year}`;
      return customTimestampFormat
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    default:
      return `${day}/${month}/${year}`;
  }
}

// Hàm vẽ timestamp lên canvas
// Hàm vẽ timestamp lên canvas (luôn bị lật ngược)
// Hàm vẽ timestamp lên canvas (luôn bị lật ngược)
function drawTimestamp(context, x, y, width, height) {
  if (!showTimestamp) return;
  
  const now = new Date();
  const timestampText = formatTimestamp(now);
  
  // Kiểm tra font đã sẵn sàng chưa, nếu không dùng fallback
  const fontFamily = document.fonts.check(`12px ${timestampFont}`) ? timestampFont : 'monospace';
  
  // Tính toán vị trí dựa trên selection
  let posX, posY;
  const padding = 10;
  
  // Điều chỉnh vị trí để phù hợp với việc lật ngược
  switch (timestampPosition) {
    case 'top-left':
      posX = width - padding;
      posY = padding + timestampSize;
      break;
    case 'top-right':
      posX = padding;
      posY = padding + timestampSize;
      break;
    case 'bottom-left':
      posX = width - padding;
      posY = height - padding;
      break;
    case 'bottom-right':
      posX = padding;
      posY = height - padding;
      break;
    case 'bottom-center':
      posX = width / 2;
      posY = height - padding;
      break;
    default:
      posX = padding;
      posY = height - padding;
  }

  // Điều chỉnh căn chỉnh text cho phù hợp với việc lật ngược
  let textAlign;
  switch (timestampPosition) {
    case 'top-left':
    case 'bottom-left':
      textAlign = 'right';
      break;
    case 'top-right':
    case 'bottom-right':
      textAlign = 'left';
      break;
    case 'bottom-center':
      textAlign = 'center';
      break;
    default:
      textAlign = 'left';
  }

  context.save();
  
  // Áp dụng transform lật ngược cho timestamp
  context.translate(width, 0);
  context.scale(-1, 1);
  
  // Sử dụng font family đã được kiểm tra
  context.font = `${timestampSize}px ${fontFamily}`;
  context.fillStyle = timestampColor;
  context.textAlign = textAlign;
  context.textBaseline = 'bottom';
  context.strokeStyle = '#000000';
  context.lineWidth = 3;
  context.lineJoin = 'round';
  
  // Thêm shadow cho chữ dễ đọc
  context.shadowColor = 'rgba(0, 0, 0, 0.7)';
  context.shadowBlur = 4;
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 2;
  
  context.fillText(timestampText, posX, posY);
  context.restore();
}

// Cập nhật hàm captureFrame để thêm timestamp
function captureFrame(index) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * frameW;
  const y = row * frameH;

  ctx.save();
  ctx.translate(x + frameW, y);
  ctx.scale(-1, 1);

  // Tính tỉ lệ scale để vẽ video + overlay lên canvas
  const scaleX = frameW / video.videoWidth;
  const scaleY = frameH / video.videoHeight;
  
  // Vẽ video
  ctx.drawImage(video, 0, 0, frameW, frameH);
  
  // Vẽ overlay với scaling chính xác
  ctx.drawImage(overlay, 0, 0, video.videoWidth, video.videoHeight, 0, 0, frameW, frameH);
  
  // Vẽ grain với opacity hiện tại
  drawGrainOnCanvas(ctx, 0, 0, frameW, frameH);

  // VỀ TIMESTAMP LÊN MỖI ẢNH
  drawTimestamp(ctx, 0, 0, frameW, frameH);

  ctx.restore();

  // Vẽ grid và frame (giữ nguyên)
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
  drawOuterFrame();
  drawThemeOverlay();
}
// Preload fonts khi app khởi động
async function preloadFonts() {
  const fonts = [
    '16px FontTime', // Preload với kích thước cụ thể
    '20px FontTime'
  ];
  
  try {
    // Đảm bảo font được tải hoàn toàn trước khi tiếp tục
    await Promise.all(fonts.map(font => document.fonts.load(font)));
    console.log('✅ All fonts loaded successfully');
  } catch (error) {
    console.error('❌ Font loading failed:', error);
  }
}

// Đợi font tải xong trước khi khởi động app
preloadFonts().then(() => {
  console.log('🚀 App started with fonts ready');
});

// Gọi hàm preload khi app khởi động
preloadFonts();
