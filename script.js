// Основная логика
const savedSettings = localStorage.getItem('soundWaveSettings');
let settings = {
    frequency: 440,
    amplitude: 0.5,
    waveType: 'sine',
    isDarkTheme: false,
    isSoundOnlyMode: false
};

if (savedSettings) {
    try {
        settings = JSON.parse(savedSettings);
    } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
    }
}

let isDarkTheme = settings.isDarkTheme;
let amplitude = settings.amplitude;
let frequency = settings.frequency;
let time = 0;
let volume = 0.7;
let isSoundOnlyMode = settings.isSoundOnlyMode || false;
let audioContext;
let analyzerNode;
let dataArray;
let canvas;
let ctx;
let loadingIndicator;
let loadingSpinner;
let isGenerating = false;

// Инициализация Web Audio API
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.gain.value = amplitude * volume;
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop = function() {
        oscillator.stop();
        isGenerating = false;
    };

    // Анализируем звук для визуализации
    analyzerNode = audioContext.createAnalyser();
    oscillator.connect(analyzerNode);
    analyzerNode.fftSize = 256;
    dataArray = new Uint8Array(analyzerNode.frequencyBinCount);

    // Обновляем волну каждые 16мс
    function animateWave() {
        if (!isSoundOnlyMode) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            analyzerNode.getByteFrequencyData(dataArray);
            drawWave(dataArray);
        }
        requestAnimationFrame(animateWave);
    }
    animateWave();
}

function drawWave(dataArray) {
    const waveHeight = canvas.height / 2;
    const barWidth = (canvas.width / dataArray.length) * 2;

    ctx.beginPath();
    ctx.moveTo(0, waveHeight);

    for (let i = 0; i < dataArray.length; i++) {
        const x = i * barWidth;
        const y = waveHeight - dataArray[i] * waveHeight / 200;
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 2;
    ctx.stroke();
}

document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('waveCanvas');
    ctx = canvas.getContext('2d');
    loadingIndicator = document.querySelector('.loading-overlay');
    loadingSpinner = document.getElementById('loadingSpinner');

    // Применение начальной темной темы
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }

    // Применение режима "Только звук"
    if (isSoundOnlyMode) {
        canvas.style.display = 'none';
        const soundOnlyLabel = document.getElementById('soundOnlyLabel');
        soundOnlyLabel.textContent = 'Visualization Disabled (Sound Only Mode)';
    } else {
        const soundOnlyLabel = document.getElementById('soundOnlyLabel');
        soundOnlyLabel.textContent = 'Enable Sound Only Mode';
    }

    // Инициализация Web Audio API
    initAudio();

    // Обновление отображения настроек
    function updateSettingsDisplay() {
        const freqPercent = Math.round(frequency * 10);
        const ampPercent = Math.round(amplitude * 20);
        document.getElementById('frequencyValue').textContent = `${freqPercent} Hz`;
        document.getElementById('amplitudeValue').textContent = `${ampPercent}%`;
    }

    // Анимация плавного изменения параметров
    let isAnimatingFrequency = false;
    let isAnimatingAmplitude = false;
    let targetFrequency = 0;
    let targetAmplitude = 0;

    function animateToTarget(target, current, duration = 500) {
        const startTime = performance.now();
        const startValue = current;
        const delta = target - startValue;

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = Math.pow(progress, 2); // easeInOutQuad
            const newValue = startValue + delta * easedProgress;

            if (target === targetFrequency) {
                frequency = newValue;
                oscillator.frequency.value = newValue;
            } else if (target === targetAmplitude) {
                amplitude = newValue;
                gainNode.gain.value = newValue * volume;
            }
            updateSettingsDisplay();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }

    // Звуковые эффекты
    const clickSound = new Howl({
        src: ['assets/audio/click.wav']
    });

    const loadingSound = new Howl({
        src: ['assets/audio/loading.wav']
    });

    const errorSound = new Howl({
        src: ['assets/audio/error.wav']
    });

    // Обновление отображения настроек при изменении параметров
    document.getElementById('frequencySlider').addEventListener('input', function() {
        targetFrequency = this.value;
        animateToTarget(targetFrequency, frequency);
    });

    document.getElementById('amplitudeSlider').addEventListener('input', function() {
        targetAmplitude = this.value;
        animateToTarget(targetAmplitude, amplitude);
    });

    // Генерация волны и индикатор загрузки
    document.getElementById('generateBtn').addEventListener('click', function() {
        if (isGenerating) return;

        isGenerating = true;
        loadingIndicator.style.display = 'flex';
        loadingSpinner.style.display = 'block';
        loadingSound.play();

        // Добавим анимацию заполнения волны
        function animateLoading() {
            if (!isGenerating) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const waveHeight = canvas.height / 2;
            const barWidth = (canvas.width / 256) * 2;
            const progress = Math.min(time / 500, 1); // Заполнение за 500мс

            ctx.beginPath();
            ctx.moveTo(0, waveHeight);
            for (let i = 0; i < 256; i++) {
                const x = i * barWidth;
                const y = waveHeight - (progress * dataArray[i] * waveHeight / 200);
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(74, 144, 226, ${progress})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            if (progress < 1) {
                time += 16;
                requestAnimationFrame(animateLoading);
            } else {
                isGenerating = false;
                loadingIndicator.style.display = 'none';
                loadingSpinner.style.display = 'none';
            }
        }
        animateLoading();
    });

    // Toggle Theme
    document.getElementById('toggleTheme').addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('soundWaveSettings', JSON.stringify(settings));
        clickSound.play();
    });

    // Toggle Sound Only Mode
    document.getElementById('soundOnlyToggle').addEventListener('click', function() {
        isSoundOnlyMode = !isSoundOnlyMode;
        if (isSoundOnlyMode) {
            canvas.style.display = 'none';
            const soundOnlyLabel = document.getElementById('soundOnlyLabel');
            soundOnlyLabel.textContent = 'Visualization Disabled (Sound Only Mode)';
        } else {
            canvas.style.display = 'block';
            const soundOnlyLabel = document.getElementById('soundOnlyLabel');
            soundOnlyLabel.textContent = 'Enable Sound Only Mode';
        }
        localStorage.setItem('soundWaveSettings', JSON.stringify(settings));
        clickSound.play();
    });

    // Обновление отображения настроек
    updateSettingsDisplay();
});