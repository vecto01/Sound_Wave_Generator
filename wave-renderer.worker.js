// Web Worker для рендеринга волн

// Параметры волны
let frequency = 440;
let amplitude = 50;
let canvasCtx;
let animationId;
let isAnimating = true;
let timeOffset = 0;

// Кэш для предыдущих параметров
let cachedFrequency = frequency;
let cachedAmplitude = amplitude;

// Кэш точек волны для оптимизации отрисовки
let cachedPoints = [];

// Инициализация
self.onmessage = function(e) {
    if (e.data.type === 'init') {
        const { canvas, ctx } = e.data;
        canvasCtx = ctx;
        cachedFrequency = frequency;
        cachedAmplitude = amplitude;
        cachedPoints = [];
        timeOffset = 0;
        drawWave();
        if (isAnimating) {
            animate();
        }
    } else if (e.data.type === 'update') {
        frequency = e.data.frequency;
        amplitude = e.data.amplitude;
        cachedFrequency = frequency;
        cachedAmplitude = amplitude;
        cachedPoints = [];
        drawWave();
    } else if (e.data.type === 'pause') {
        cancelAnimationFrame(animationId);
        isAnimating = false;
    } else if (e.data.type === 'play') {
        isAnimating = true;
        animate();
    }
};

// Анимация волны
function animate() {
    if (!isAnimating) return;
    
    timeOffset += 0.01;
    drawWave();
    animationId = requestAnimationFrame(animate);
}

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
    
    // Кэширование точек волны
    if (cachedPoints.length === 0) {
        for (let i = 0; i <= samples; i++) {
            const x = (i / samples) * width;
            const y = centerY + Math.sin((i * frequency / 1000) * 2 * Math.PI + timeOffset) * amplitude;
            cachedPoints.push({ x, y });
        }
    } else {
        for (let i = 0; i <= samples; i++) {
            const x = (i / samples) * width;
            const y = centerY + Math.sin((i * frequency / 1000) * 2 * Math.PI + timeOffset) * amplitude;
            cachedPoints[i] = { x, y };
        }
    }
    
    // Отрисовка волны с использованием кэшированных точек
    canvasCtx.strokeStyle = '#4CAF50';
    canvasCtx.lineWidth = 2;
    canvasCtx.beginPath();
    
    for (let i = 0; i <= samples; i++) {
        const point = cachedPoints[i];
        if (i === 0) {
            canvasCtx.moveTo(point.x, point.y);
        } else {
            canvasCtx.lineTo(point.x, point.y);
        }
    }
    
    canvasCtx.stroke();
}