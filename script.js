// Основная логика

// Загрузка сохранённых настроек
const savedSettings = localStorage.getItem('soundWaveSettings');
let settings = {
    frequency: 440,      // Частота по умолчанию
    amplitude: 0.5,     // Амплитуда по умолчанию
    waveType: 'sine',   // Тип волны по умолчанию
    isDarkTheme: false, // Темная тема по умолчанию
    isSoundOnlyMode: false // Режим "Только звук" по умолчанию
};

if (savedSettings) {
    try {
        settings = JSON.parse(savedSettings);
    } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
    }

    let isDarkTheme = settings.isDarkTheme;
    let amplitude = settings.amplitude;
    let frequency = settings.frequency;
    let time = 0;
    let volume = 0.7;
    let isSoundOnlyMode = settings.isSoundOnlyMode || false;
    
    // Применение начальной темной темы
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');

    // Применение режима "Только звук"
    if (isSoundOnlyMode) {
        const canvas = document.getElementById('waveCanvas');
        canvas.style.display = 'none';
        const soundOnlyLabel = document.getElementById('soundOnlyLabel');
        soundOnlyLabel.textContent = 'Visualization Disabled (Sound Only Mode)';
    } else {
        const soundOnlyLabel = document.getElementById('soundOnlyLabel');
        soundOnlyLabel.textContent = 'Enable Sound Only Mode';
    }

    document.addEventListener('DOMContentLoaded', function() {
        const canvas = document.getElementById('waveCanvas');
        const ctx = canvas.getContext('2d');
        const loadingOverlay = document.querySelector('.loading-overlay');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const footer = document.querySelector('footer');
        const generateBtn = document.getElementById('generateBtn');
        const toggleThemeBtn = document.getElementById('toggleTheme');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        const frequencySlider = document.getElementById('frequencySlider');
        const amplitudeSlider = document.getElementById('amplitudeSlider');
        const frequencyValue = document.getElementById('frequencyValue');
        const amplitudeValue = document.getElementById('amplitudeValue');
        const soundOnlyToggle = document.getElementById('soundOnlyToggle');
        const soundOnlyLabel = document.getElementById('soundOnlyLabel');
        
        // Обновление отображения настроек
        function updateSettingsDisplay() {
            const freqPercent = Math.round(frequency * 10);
            const ampPercent = Math.round(amplitude * 20);
            frequencyValue.textContent = `${freqPercent} Hz`;
            amplitudeValue.textContent = `${ampPercent}%`;
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
                const easedProgress = easeInOutQuad(progress);
                const newValue = startValue + delta * easedProgress;
                
                if (target === targetFrequency) {
                    frequency = newValue;
                } else if (target === targetAmplitude) {
                    amplitude = newValue;
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
        frequencySlider.addEventListener('input', function() {
            targetFrequency = this.value;
            animateToTarget(targetFrequency, frequency);
        });
        
        amplitudeSlider.addEventListener('input', function() {
            targetAmplitude = this.value;
            animateToTarget(targetAmplitude, amplitude);
        });
        
        // Генерация волны
        generateBtn.addEventListener('click', function() {
            if (loadingIndicator.style.display === 'none') {
                loadingIndicator.style.display = 'block';
                loadingSound.play();
            }
        });
        
        // Функция для генерации волны
        function generateWave() {
            // Логика генерации волны
            // ... 
        }
        
        // Toggle Theme
        toggleThemeBtn.addEventListener('click', function() {
            isDarkTheme = !isDarkTheme;
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('soundWaveSettings', JSON.stringify(settings));
            clickSound.play();
        });
        
        // Toggle Sound Only Mode
        soundOnlyToggle.addEventListener('click', function() {
            isSoundOnlyMode = !isSoundOnlyMode;
            if (isSoundOnlyMode) {
                canvas.style.display = 'none';
                soundOnlyLabel.textContent = 'Visualization Disabled (Sound Only Mode)';
            } else {
                canvas.style.display = 'block';
                soundOnlyLabel.textContent = 'Enable Sound Only Mode';
            }
            localStorage.setItem('soundWaveSettings', JSON.stringify(settings));
            clickSound.play();
        });
        
        // Обновление отображения настроек
        updateSettingsDisplay();
    });