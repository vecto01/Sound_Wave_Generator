// Web Worker для рендеринга волн

// Параметры волны
let frequency = 440;
let amplitude = 50;
let canvasCtx;
let animationId;
let isAnimating = false;

// Инициализация
self.onmessage = function(e) {
    if (e.data.type === 'init') {
        const { canvas, ctx } = e.data;
        canvasCtx = ctx;
        drawWave();
    } else if (e.data.type === 'update') {
        frequency = e.data.frequency;
        amplitude = e.data.amplitude;
        drawWave();
    } else if (e.data.type === 'stop') {
        cancelAnimationFrame(animationId);
        isAnimating = false;
    }
};

// Рендеринг волны
function drawWave() {
    if (!canvasCtx) return;
    
    const width = canvasCtx.canvas.width;
    const height = canvasCtx.canvas.height;
    const centerY = height / 2;
    const samples = width * 2;
    
    canvasCtx.clearRect(0, 0, width, height);
    
    // Отрисовка осей
    canvasCtx.strokeStyle = '#ccc';
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, centerY);
    canvasCtx.lineTo(width, centerY); // Ось X
    canvasCtx.moveTo(width / 2, 0);
    canvasCtx.lineTo(width / 2, height); // Ось Y
    canvasCtx.stroke();
    
    // Отрисовка волны
    canvasCtx.strokeStyle = '#4CAF50';
    canvasCtx.lineWidth = 2;
    canvasCtx.beginPath();
    
    for (let i = 0; i <= samples; i++) {
        const x = (i / samples) * width;
        const y = centerY + Math.sin((i * frequency / 1000) * 2 * Math.PI) * amplitude;
        
        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
    }
    
    canvasCtx.stroke();
    
    if (isAnimating) {
        animationId = requestAnimationFrame(drawWave);
    }
}