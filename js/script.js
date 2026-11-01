// Инициализация WaveRenderer
const WaveRenderer = (() => {
    let canvas;
    let ctx;
    const settings = {
        frequency: 1.0,
        amplitude: 0.5,
        waveType: 'sine'
    };
    
    const waveRenderer = {
        init: function() {
            canvas = document.getElementById('waveCanvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');
            waveRenderer.resizeCanvas();
        },
        resizeCanvas: function() {
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                waveRenderer.renderWave();
            }
        },
        renderWave: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const samplesLength = 100;
            const waveHeight = canvas.height / 2;
            
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
            
            for (let i = 0; i < samplesLength; i++) {
                const x = (i / samplesLength) * canvas.width;
                let y;
                
                if (settings.waveType === 'sine') {
                    y = canvas.height / 2 + Math.sin((i * Math.PI / samplesLength) * settings.frequency * 2) * settings.amplitude * waveHeight;
                } else if (settings.waveType === 'square') {
                    y = canvas.height / 2 + Math.abs(Math.sin((i * Math.PI / samplesLength) * settings.frequency * 2)) * settings.amplitude * waveHeight * (Math.sin((i * Math.PI / samplesLength) * settings.frequency * 2) < 0 ? -1 : 1);
                }
                
                if (i === 0) ctx.beginPath();
                ctx.moveTo(x, y);
                
                for (let j = 1; j < i; j++) {
                    const prevX = ((j - 1) / samplesLength) * canvas.width;
                    const prevY = canvas.height / 2 + Math.sin((j * Math.PI / samplesLength) * settings.frequency * 2) * settings.amplitude * waveHeight;
                    ctx.lineTo(prevX, prevY);
                }
            }
            
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.stroke();
        },
        updateWave: function() {
            waveRenderer.renderWave();
        }
    };
    
    return waveRenderer;
})();

// Звуковые эффекты и обработка событий
const howler = new Howl({
    preload: true,
    onplay: function() {
        this.stop();
    }
});

// Функции для индикатора загрузки
function showLoadingIndicator() {
    document.querySelector('.loading-container').classList.add('loaded');
    document.getElementById('waveCanvas').style.opacity = '0';
    document.getElementById('generateBtn').style.opacity = '0.5';
    
    // Воспроизведение звука загрузки
    const loadingSound = new Howl({
        src: ['assets/audio/loading.wav'],
        onend: hideLoadingIndicator
    });
    loadingSound.play();
}

function hideLoadingIndicator() {
    document.querySelector('.loading-container').classList.remove('loaded');
    document.getElementById('waveCanvas').style.opacity = '1';
    document.getElementById('generateBtn').style.opacity = '1';
    
    // Воспроизведение звука успеха
    const successSound = new Howl({
        src: ['assets/audio/success.wav']
    });
    successSound.play();
}

// Обработка кнопки генерации
function generateWave() {
    showLoadingIndicator();
    
    // Плавная генерация волны
    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');
    
    let phase = 0;
    const animationId = requestAnimationFrame(updateWaveAnimation);
    
    function updateWaveAnimation() {
        waveRenderer.updateWave();
        
        // Плавное обновление волны с easing
        phase += 0.02;
        const progress = Math.min(1, phase);
        
        // Изменение цвета волны
        ctx.fillStyle = `rgba(76, 175, 80, ${progress})`;
        ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
        
        // Сглаженная линия волны
        ctx.strokeStyle = `rgba(76, 175, 80, ${progress})`;
        
        if (progress < 1) {
            requestAnimationFrame(updateWaveAnimation);
        } else {
            cancelAnimationFrame(animationId);
            
            // Воспроизведение звука успеха
            const successSound = new Howl({
                src: ['assets/audio/success.wav']
            });
            successSound.play();
        }
    }
}

// Обработка слайдеров
function handleSliderChange() {
    const frequencySlider = document.getElementById('frequencySlider');
    const amplitudeSlider = document.getElementById('amplitudeSlider');
    
    settings.frequency = parseFloat(frequencySlider.value);
    settings.amplitude = parseFloat(amplitudeSlider.value);
    updateWaveRenderer();
    
    // Звуковые эффекты при изменении параметров
    const clickSound = new Howl({
        src: ['assets/audio/click.wav']
    });
    clickSound.play();
}

// Обновление WaveRenderer при изменении параметров
function updateWaveRenderer() {
    waveRenderer.updateWave();
}

// Инициализация WaveRenderer при загрузке страницы
window.addEventListener('load', () => {
    waveRenderer.init();
    
    // Подключение обработчиков событий
    document.getElementById('generateBtn').addEventListener('click', generateWave);
    document.getElementById('sineWave').addEventListener('click', () => {
        settings.waveType = 'sine';
        updateWaveRenderer();
    });
    document.getElementById('squareWave').addEventListener('click', () => {
        settings.waveType = 'square';
        updateWaveRenderer();
    });
    
    document.getElementById('frequencySlider').addEventListener('input', handleSliderChange);
    document.getElementById('amplitudeSlider').addEventListener('input', handleSliderChange);
});