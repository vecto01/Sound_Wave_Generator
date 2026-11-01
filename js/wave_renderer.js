const WaveRenderer = (() => {
    let canvas;
    let ctx;
    let audioContext;
    let oscillator;
    let gainNode;
    let animationId;
    let frequency = 440;
    let amplitude = 0.5;
    let waveColor = '#4CAF50';
    let samples = [];
    let sampleCount = 44100;
    
    // Кэшируем предыдущие значения для оптимизации
    let cachedFrequency = 440;
    let cachedAmplitude = 0.5;
    let cachedSamples = [];
    
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        if (!canvas || !ctx) {
            console.error('Canvas is not initialized.');
            return;
        }
    }
    
    function resizeCanvas() {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            renderWave();
        }
    }
    
    function renderWave() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Для простоты используем псевдо-анимацию с использованием requestAnimationFrame
        ctx.fillStyle = waveColor;
        ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
        
        // Пример плавной анимации волны через requestAnimationFrame
        if (!animationId) {
            animationId = requestAnimationFrame(updateWaveAnimation);
        }
    }
    
    function updateWaveAnimation() {
        if (!audioContext || !oscillator) return;
        
        // Получаем текущие параметры
        const currentFrequency = settings.frequency || cachedFrequency;
        const currentAmplitude = settings.amplitude || cachedAmplitude;
        
        // Если параметры не изменились, не пересчитываем волну
        if (currentFrequency === cachedFrequency && currentAmplitude === cachedAmplitude) {
            requestAnimationFrame(updateWaveAnimation);
            return;
        }
        
        // Обновляем кэш
        cachedFrequency = currentFrequency;
        cachedAmplitude = currentAmplitude;
        
        // Пересчитываем волну
        const samplesLength = 100; // Количество точек для рисования волны
        const waveHeight = canvas.height / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = waveColor;
        
        for (let i = 0; i < samplesLength; i++) {
            const x = (i / samplesLength) * canvas.width;
            const y = canvas.height / 2 + Math.sin((i * Math.PI / samplesLength) * currentFrequency * 2) * currentAmplitude * waveHeight;
            
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Перезапускаем анимацию
        animationId = requestAnimationFrame(updateWaveAnimation);
    }
    
    return {
        init,
        resizeCanvas,
        renderWave,
        updateWaveAnimation
    };
});