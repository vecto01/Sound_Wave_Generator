// Тест производительности на слабых устройствах
// Этот скрипт запускается в консоли Chrome DevTools

// Создаем тестовые данные
const testData = {
    frequency: 440,
    amplitude: 50,
    iterations: 50,
    canvasWidth: 600,
    canvasHeight: 300,
    fpsTestIterations: 100,
    fpsTestDuration: 2000 // 2 секунды для тестирования FPS
};

// Функция для тестирования частоты обновления анимации (FPS)
function testFps() {
    const startTime = performance.now();
    let frames = 0;
    const canvas = document.createElement('canvas');
    canvas.width = testData.canvasWidth;
    canvas.height = testData.canvasHeight;
    const ctx = canvas.getContext('2d');

    const renderLoop = () => {
        const now = performance.now();
        frames++;
        if (now - startTime >= testData.fpsTestDuration) {
            const fps = (frames / (testData.fpsTestDuration / 1000)).toFixed(2);
            console.log(`FPS: ${fps}`);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const t = (now / 1000) + x / canvas.width;
            const y = canvas.height / 2 + Math.sin(t * testData.frequency) * testData.amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        requestAnimationFrame(renderLoop);
    };

    // Запуск тестов
    console.log('Начинаем тестирование производительности...');
    testWaveRenderingPerformance();
    testFps();
    testAudioPerformance();

    // Создаем тестовые данные
    const testData = {

// Функция для тестирования производительности рендеринга волны
function testWaveRenderingPerformance() {
    const startTime = performance.now();
    const canvas = document.createElement('canvas');
    canvas.width = testData.canvasWidth;
    canvas.height = testData.canvasHeight;
    const ctx = canvas.getContext('2d');
    
    // Тест рендеринга волны
    for (let i = 0; i < testData.iterations; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        
        // Рендерим волну
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const t = (i + x / canvas.width) * 0.01;
            const y = canvas.height / 2 + Math.sin(t * testData.frequency) * testData.amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Производительность рендеринга волны: ${duration.toFixed(2)} мс за ${testData.iterations} итераций`);
    console.log(`Среднее время за итерацию: ${(duration / testData.iterations).toFixed(2)} мс`);
    return duration;
}

// Функция для тестирования производительности AudioContext
function testAudioPerformance() {
    if (typeof AudioContext !== 'undefined') {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = testData.frequency;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const startTime = performance.now();
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
        
        // Ждем завершения воспроизведения
        setTimeout(() => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`Производительность AudioContext: ${duration.toFixed(2)} мс`);
        }, 1000);
    } else {
        console.log('AudioContext не поддерживается');
    }
}

// Запуск тестов
console.log('Начинаем тестирование производительности...');
const renderingTime = testWaveRenderingPerformance();
console.log('Тест рендеринга завершен.');
testAudioPerformance();
console.log('Тест Audio завершен.');