
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const statusText = document.getElementById('status');
const frameColorPicker = document.getElementById('frameColor');
const countdownInput = document.getElementById('countdownTime');
const themeSelect = document.getElementById('themeSelect');

let frameColor = "#f7f2f2ff";
let currentTheme = "none";
let themeImages = {};

const rows = 3, cols = 2;
const bottomPadding = 100;
const frameW = canvas.width / cols;
const frameH = (canvas.height - bottomPadding) / rows;

// --- Preload theme images --- //
function preloadThemes() {
  const themes = ['Đi làm'];
  themes.forEach(theme => {
    const img = new Image();
    img.src = `themes/${theme}.png`;
    themeImages[theme] = img;
  });
}

// --- Mở camera --- //
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

// --- Vẽ khung viền ngoài --- //
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


// --- Vẽ theme overlay --- //
function drawThemeOverlay() {
  if (currentTheme !== "none" && themeImages[currentTheme]) {
    const img = themeImages[currentTheme];
    if (img.complete && img.naturalHeight !== 0) {
      // Vẽ theme overlay lên toàn bộ canvas
      // Độ trong suốt
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
       // Reset độ trong suốt
    }
  }
}

// --- Vẽ lưới chia --- //
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

  // Vẽ theme overlay
  drawThemeOverlay();
}

// Khởi tạo canvas ban đầu
preloadThemes();
drawGrid();

// --- Đổi màu khung --- //
frameColorPicker.addEventListener("input", () => {
  frameColor = frameColorPicker.value;
  drawGrid();
});

// --- Đổi chủ đề --- //
themeSelect.addEventListener("change", () => {
  currentTheme = themeSelect.value;
  drawGrid();
});

// --- Hàm chụp từng khung --- //
function captureFrame(index) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * frameW;
  const y = row * frameH;

  ctx.save();
  ctx.translate(x + frameW, y);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, frameW, frameH);
  ctx.restore();

  // Vẽ lại viền
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
  // Vẽ lại theme overlay sau khi chụp
  drawThemeOverlay();
}

// --- Bắt đầu quá trình chụp --- //
function startCapture() {
  startBtn.style.display = "none";
  statusText.style.display = "inline-block";

  drawGrid();

  let count = 0;
  let timeLeft = parseInt(countdownInput.value);

  const timer = setInterval(() => {
    if (timeLeft === 0) {
      captureFrame(count);
      count++;

      if (count >= 6) {
        clearInterval(timer);
        statusText.textContent = "✅ Hoàn tất chụp 6 ảnh!";
        setTimeout(() => {
          startBtn.style.display = "inline-block";
          statusText.style.display = "none";
        }, 3000);

        // Tự tải ảnh
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
