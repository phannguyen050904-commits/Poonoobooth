
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


let frameColor = "#ffffff";
let currentTheme = "none";
let selectedFilter = "none";
let filterActive = false;
let themeImages = {};

const rows = 3, cols = 2;
const bottomPadding = 100;
const frameW = canvas.width / cols;
const frameH = (canvas.height - bottomPadding) / rows;

// --- Mở camera ---
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Không mở được camera:", err));

// --- Preload theme ---
function preloadThemes() {
  const themes = ['Đi làm', 'Danisa'];
  themes.forEach(theme => {
    const img = new Image();
    img.src = `themes/${theme}.png`;
    themeImages[theme] = img;
  });
}
preloadThemes();

// --- Vẽ khung viền ---
function drawOuterFrame() {
  const outerLineWidth = 10;
  const bottomLineWidth = 100;
  const topLineWidth = 10;
  ctx.strokeStyle = frameColor;

  // 3 cạnh mỏng
  ctx.lineWidth = outerLineWidth;
  ctx.beginPath();
  ctx.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctx.lineTo(canvas.width - outerLineWidth / 2, outerLineWidth / 2);
  ctx.moveTo(outerLineWidth / 2, outerLineWidth / 2);
  ctx.lineTo(outerLineWidth / 2, canvas.height - outerLineWidth / 2);
  ctx.moveTo(canvas.width - outerLineWidth / 2, outerLineWidth / 2);
  ctx.lineTo(canvas.width - outerLineWidth / 2, canvas.height - outerLineWidth / 2);
  ctx.stroke();

  // cạnh đáy dày
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

  // Cột
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * frameW, 0);
    ctx.lineTo(i * frameW, canvas.height);
    ctx.stroke();
  }

  // Hàng
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
    requestAnimationFrame(detectFacesLive);
    return;
  }

  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

  if (detections.length > 0) {
    detections.forEach(d => {
      const landmarks = d.landmarks;
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      if (selectedFilter === "mustache") {
        const x = nose[3].x - 40;
        const y = nose[3].y + 10;
        overlayCtx.fillStyle = "black";
        overlayCtx.fillRect(x, y, 80, 10);
      }
        if (selectedFilter === "Sơn Tùng-MTP") {
        const img = new Image();
        img.src = "filters/Sơn Tùng-MTP.png";
        img.onload = () => {
            // Tính khoảng cách giữa 2 mắt
          const faceWidth = Math.abs(rightEye[3].x - leftEye[0].x) * 2.2; // nhân 2.2 để rộng hơn chút
          const faceHeight = faceWidth * 0.35; // giữ tỉ lệ gốc

  // Tâm giữa hai mắt
          const centerX = (leftEye[3].x + rightEye[0].x) / 2 - faceWidth*0.6;
          const centerY = (nose[0].y - faceHeight * 3);

          overlayCtx.drawImage(
            img,
            centerX - faceWidth / 2,
            centerY - faceHeight / 2,
            faceWidth,
            faceHeight
          );
          
        }
        
      }
      if (selectedFilter === "T1 6 sao") {
        const img = new Image();
        img.src = "filters/T1 6 sao.png";
        img.onload = () => {
            // Tính khoảng cách giữa 2 mắt
          const faceWidth = Math.abs(rightEye[3].x - leftEye[0].x) * 2.2; // nhân 2.2 để rộng hơn chút
          const faceHeight = faceWidth * 0.35; // giữ tỉ lệ gốc

  // Tâm giữa hai mắt
          const centerX = (leftEye[3].x + rightEye[0].x) / 2 - faceWidth*0.6;
          const centerY = (nose[0].y - faceHeight * 2.9);

          overlayCtx.drawImage(
            img,
            centerX - faceWidth / 2,
            centerY - faceHeight / 2,
            faceWidth,
            faceHeight
          );
          
        }
        
      }
    });
  }

  requestAnimationFrame(detectFacesLive);
}

filterSelect.addEventListener("change", async () => {
  selectedFilter = filterSelect.value;

  if (selectedFilter === "none") {
    filterActive = false;
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    return;
  }

  if (!filterActive) {
    await loadFaceModels();
    filterActive = true;
  }

  detectFacesLive();
});

// --- Chụp ảnh ---
function captureFrame(index) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * frameW;
  const y = row * frameH;

  ctx.save();
  ctx.translate(x + frameW, y);
  ctx.scale(-1, 1);

  // Vẽ video + overlay filter
  ctx.drawImage(video, 0, 0, frameW, frameH);
  ctx.drawImage(overlay, 0, 0, frameW, frameH);
  

  ctx.restore();
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
