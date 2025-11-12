// grain.js
class GrainTexture {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.active = false;
        this.opacity = 0.15;
        this.size = 1; // Kích thước hạt
    }

    // Tạo texture grain từ ảnh JPG
    loadFromImage(imageSrc) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.drawImage(img, 0, 0);
                this.active = true;
                resolve();
            };
            img.onerror = reject;
            img.src = imageSrc;
        });
    }

    // Tạo grain ngẫu nhiên (fallback nếu không có ảnh)
    generateRandomGrain(width = 400, height = 300) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 255;
            data[i] = value;     // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
            data[i + 3] = 255;   // A
        }

        this.ctx.putImageData(imageData, 0, 0);
        this.active = true;
    }

    // Áp dụng grain lên canvas
    applyToCanvas(targetCtx, width, height) {
        if (!this.active) return;

        // Lưu trạng thái context
        targetCtx.save();
        
        // Áp dụng grain với blend mode
        targetCtx.globalAlpha = this.opacity;
        targetCtx.globalCompositeOperation = 'overlay';
        
        // Vẽ grain texture
        targetCtx.drawImage(this.canvas, 0, 0, width, height);
        
        // Khôi phục context
        targetCtx.restore();
    }

    setOpacity(value) {
        this.opacity = Math.max(0, Math.min(1, value));
    }
}

const grainManager = new GrainTexture();
export default grainManager;