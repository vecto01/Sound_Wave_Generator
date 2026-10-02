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
    
    // Загрузка сохранённых настроек
    const savedSettings = localStorage.getItem('soundWaveSettings');
    let settings = {
        frequency: 440,      // Частота по умолчанию
        amplitude: 0.5,     // Амплитуда по умолчанию
        waveType: 'sine',   // Тип волны по умолчанию
        isDarkTheme: false  // Темная тема по умолчанию
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
    
    // Применение начальной темной темы
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
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
    
    // Обновление отображения настроек
    function updateSettingsDisplay() {
        const freqPercent = Math.round(frequency * 10);
        const ampPercent = Math.round(amplitude * 20);
        frequencyValue.textContent = `${freqPercent} Hz`;
        amplitudeValue.textContent = `${ampPercent}%`;
    }
    
    // Настройка обработчиков слайдеров
    frequencySlider.addEventListener('input', function() {
        frequency = parseFloat(this.value);
        updateSettingsDisplay();
        saveSettings();
    });
    
    amplitudeSlider.addEventListener('input', function() {
        amplitude = parseFloat(this.value);
        updateSettingsDisplay();
        saveSettings();
    });
    
    // Сохранение настроек в localStorage
    function saveSettings() {
        const updatedSettings = {
            frequency: frequency,
            amplitude: amplitude,
            waveType: settings.waveType,
            isDarkTheme: isDarkTheme
        };
        localStorage.setItem('soundWaveSettings', JSON.stringify(updatedSettings));
    }
    
    // Загрузка сохранённой громкости
    if (savedVolume) {
        volume = parseFloat(savedVolume);
        volumeSlider.value = volume;
    }

    // Обновление отображения громкости
    function updateVolumeDisplay() {
        const percentage = Math.round(volume * 100);
        volumeValue.textContent = `${percentage}%`;
    }

    // Настройка обработчика для слайдера
    volumeSlider.addEventListener('input', function() {
        volume = parseFloat(this.value);
        updateVolumeDisplay();
        localStorage.setItem('soundWaveVolume', volume);
        clickSound.volume(volume);
        loadingSound.volume(volume);
        errorSound.volume(volume);
    });

    // Применение сохранённой громкости к звукам
    clickSound.volume(volume);
    loadingSound.volume(volume);
    errorSound.volume(volume);
    updateVolumeDisplay();

    // Инициализация
    function init() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    // Показ лоадера
    function showLoading() {
        loadingOverlay.classList.add('show');
        loadingIndicator.classList.add('show');
        canvas.style.display = 'none';
        canvas.style.opacity = '0';
        canvas.style.transform = 'scale(0.9)';
    }

    // Скрытие лоадера и показ волны
    function hideLoading() {
        loadingOverlay.classList.remove('show');
        loadingIndicator.classList.remove('show');
        footer.classList.add('show');
        canvas.style.opacity = '1';
        canvas.style.transform = 'scale(1)';
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
    }

    // Генерация волны
    function generateWave() {
        const generatingIndicator = document.getElementById('generatingIndicator');
        generatingIndicator.style.display = 'flex';
        loadingSound.play();
        showLoading();

        const progressIndicator = document.getElementById('progressIndicator');
        progressIndicator.style.display = 'flex';

        // Передача настроек в audio_generator.js
        window.updateSettings({
            frequency: frequency,
            amplitude: amplitude,
            waveType: settings.waveType
        });

        generateSound(progress => {
            const progressBar = progressIndicator.querySelector('.progress-bar::after');
            progressBar.style.width = `${progress}%`;
            progressIndicator.querySelector('.progress-text').textContent = `Generating... ${progress}%`;

            if (progress >= 100) {
                setTimeout(() => {
                    hideLoading();
                    const completionMessage = document.getElementById('completionMessage');
                    completionMessage.style.display = 'flex';
                    generatingIndicator.style.display = 'none';
                    setTimeout(() => {
                        completionMessage.style.display = 'none';
                    }, 2000);
                }, 500);
            }
        });

        setTimeout(() => {
            canvas.classList.add('fade-in');
            drawWave();
        }, 500);
    }

    // Рисование волны
    function drawWave() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--wave-color');
        ctx.lineWidth = 2;

        for (let x = 0; x < canvas.width; x++) {
            const y = Math.sin(x / amplitude + time) * amplitude + canvas.height / 2;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
        time += 0.05;
        requestAnimationFrame(drawWave);
    }

    // Переключение тем
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme', isDarkTheme);
        toggleThemeBtn.textContent = isDarkTheme ? 'Toggle Light Theme' : 'Toggle Dark Theme';
        settings.isDarkTheme = isDarkTheme;
        saveSettings();
    }

    // События
    generateBtn.addEventListener('click', function() {
        clickSound.play();
        generateBtn.disabled = true;
        generateBtn.classList.add('loading');
        generateWave();
    });

    toggleThemeBtn.addEventListener('click', function() {
        clickSound.play();
        toggleThemeBtn.disabled = true;
        toggleTheme();
        setTimeout(() => {
            toggleThemeBtn.disabled = false;
        }, 300);
    });

    // Обновление настроек при переключении тем
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }

    // Обработка кнопок экспорта
    const exportBtns = [
        document.getElementById('exportPng'),
        document.getElementById('exportSvg')
    ];

    exportBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            clickSound.play();
        });
    });

    // Инициализация при загрузке
    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });

    // Автоматическая генерация волны при загрузке страницы
    setTimeout(() => {
        generateWave();
    }, 500);

    // Обработка генерации звука
    function generateSound(callback) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                callback(100);
            } else {
                callback(progress);
            }
        }, 100);
    }
});