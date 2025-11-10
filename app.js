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

let frameColor = "#000000";
let currentTheme = "none";
let selectedFilter = "none";
let filterActive = false;
let themeImages = {};
let filterImages = {};
let detectionInProgress = false;
let animationFrameId = null;

const rows = 3, cols = 2;
const bottomPadding = 100;
let frameW, frameH;

// --- Khởi tạo kích thước canvas ---
function setupCanvasSize() {
  const container = document.querySelector('.canvas-container');
  
  // Lấy kích thước thực tế của container
  const containerWidth = container.clientWidth;
  const containerHeight = containerWidth * (4/3); // Tỉ lệ 4:3
  
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  
  // Cập nhật lại grid dimensions
  frameW = canvas.width / cols;
  frameH = (canvas.height - bottomPadding) / rows;
  
  // Vẽ lại grid
  drawGrid();
}

// --- Mở camera ---
navigator.mediaDevices.getUserMedia({ 
  video: { 
    width: { ideal: 1280 },
    height: { ideal: 720 }
  } 
})
.then(stream => {
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    handleResize();
    setupCanvasSize();
  };
})
.catch(err => {
  console.error("Không mở được camera:", err);
  statusText.textContent = "❌ Lỗi camera! Vui lòng cho phép truy cập camera.";
  statusText.style.display = "block";
});

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
    { name: "Sơn Tùng-MTP", path: "filters/Sơn Tùng-MTP.png", offsetY: 3 },
    { name: "T1 6 sao", path: "filters/T1 6 sao.png", offsetY: 2.9 }
  ];

  filters.forEach(filter => {
    const img = new Image();
    img.src = filter.path;
    img.onload = () => {
      console.log(`✅ Filter ${filter.name} loaded`);
    };
    filterImages[filter.name] = {
      image: img,
      offsetY: filter.offsetY
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

    if (detections.length > 0 && selectedFilter !== "none") {
      const currentFilter = filterImages[selectedFilter];
      
      if (currentFilter && currentFilter.image.complete) {
        detections.forEach(d => {
          const landmarks = d.landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          const faceWidth = Math.abs(rightEye[3].x - leftEye[0].x) * 2.2;
          const faceHeight = faceWidth * 0.35;
          const centerX = (leftEye[3].x + rightEye[0].x) / 2 - faceWidth * 0.6;
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

// --- Chụp ảnh (KHÔNG KÉO GIÃN) ---
function captureFrame(index) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * frameW;
  const y = row * frameH;

  ctx.save();
  
  // Tính tỉ lệ scale để giữ nguyên tỉ lệ video (KHÔNG KÉO GIÃN)
  const videoAspect = video.videoWidth / video.videoHeight;
  const frameAspect = frameW / frameH;
  
  let drawWidth, drawHeight, offsetX, offsetY;
  
  if (videoAspect > frameAspect) {
    // Video rộng hơn frame -> fit theo chiều cao
    drawHeight = frameH;
    drawWidth = drawHeight * videoAspect;
    offsetX = (frameW - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Video cao hơn frame -> fit theo chiều rộng
    drawWidth = frameW;
    drawHeight = drawWidth / videoAspect;
    offsetX = 0;
    offsetY = (frameH - drawHeight) / 2;
  }

  // Vẽ video với tỉ lệ chính xác (KHÔNG KÉO GIÃN)
  ctx.translate(x + frameW, y);
  ctx.scale(-1, 1);
  ctx.drawImage(video, -offsetX, offsetY, drawWidth, drawHeight);
  
  // Vẽ overlay filter với cùng tỉ lệ
  if (overlay.width > 0 && overlay.height > 0) {
    ctx.drawImage(overlay, -offsetX, offsetY, drawWidth, drawHeight);
  }

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

async function startCapture() {
  startBtn.style.display = "none";
  statusText.style.display = "block";
  drawGrid();

  const totalFrames = 6;
  const delaySeconds = parseInt(countdownInput.value);

  for (let i = 0; i < totalFrames; i++) {
    let timeLeft = delaySeconds;

    while (timeLeft > 0) {
      statusText.textContent = `Ảnh ${i + 1}/${totalFrames} chụp sau ${timeLeft--}s`;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    captureFrame(i);
  }

  statusText.textContent = "Tada!!!";
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Hiện nút lại
  startBtn.style.display = "block";
  statusText.style.display = "none";

  // Tải ảnh về
  const link = document.createElement('a');
  link.download = 'photo_strip.png';
  link.href = canvas.toDataURL();
  link.click();
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
window.addEventListener('resize', () => {
  handleResize();
  setupCanvasSize();
});
window.addEventListener('load', setupCanvasSize);
video.addEventListener('play', handleResize);

// Khởi tạo lần đầu
setupCanvasSize();