#!/usr/bin/env node
// Объединённый скрипт для Sound Wave Generator

// audio.js (часть 1)
// Функции для клавиатурной навигации и модальных окон
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function focusNextTabbableElement(currentElement) {
    const allTabbableElements = document.querySelectorAll('[tabindex="0"]:not([disabled]):not([aria-hidden])');
    const currentIndex = Array.from(allTabbableElements).indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % allTabbableElements.length;
    allTabbableElements[nextIndex].focus();
}

function focusPrevTabbableElement(currentElement) {
    const allTabbableElements = document.querySelectorAll('[tabindex="0"]:not([disabled]):not([aria-hidden])');
    const currentIndex = Array.from(allTabbableElements).indexOf(currentElement);
    const prevIndex = (currentIndex - 1 + allTabbableElements.length) % allTabbableElements.length;
    allTabbableElements[prevIndex].focus();
}

function setupKeyboardNavigation() {
    const allTabbableElements = document.querySelectorAll('[tabindex="0"]');
    
    allTabbableElements.forEach(element => {
        element.addEventListener('keydown', function(event) {
            if (event.key === 'Tab') {
                event.preventDefault();
                focusNextTabbableElement(this);
            }
            else if (event.key === 'Tab' && event.shiftKey) {
                event.preventDefault();
                focusPrevTabbableElement(this);
            }
            else if (event.key === 'Enter' && (this.tagName === 'BUTTON' || this.classList.contains('btn'))) {
                event.preventDefault();
                this.click();
            }
            else if (event.key === 'Escape' && document.getElementById('preset-modal').style.display === 'block') {
                event.preventDefault();
                closeModal();
            }
        });
    });
}

// Функции для модальных окон
function showErrorModal(title, message) {
    const modal = document.getElementById('error-modal');
    const modalTitle = document.getElementById('error-modal-title');
    const modalMessage = document.getElementById('error-modal-message');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function showPreloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('active');
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.remove('active');
    const app = document.getElementById('app');
    app.classList.add('active');
}

// Сохранение и загрузка настроек
let presets = JSON.parse(localStorage.getItem('soundWavePresets')) || [];

function renderPresetsList() {
    const presetsList = document.getElementById('presets-list');
    const presetsListItems = document.getElementById('presets-list-items');
    const presetsListBtn = document.getElementById('presets-list-btn');
    
    presetsListItems.innerHTML = '';
    
    if (presets.length === 0) {
        const noPresetsItem = document.createElement('li');
        noPresetsItem.textContent = 'No presets saved yet.';
        noPresetsItem.style.color = '#666';
        presetsListItems.appendChild(noPresetsItem);
    } else {
        presets.forEach((preset, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = preset.name || `Preset ${index + 1}`;
            listItem.dataset.index = index;
            listItem.addEventListener('click', () => loadPreset(index));
            presetsListItems.appendChild(listItem);
        });
    }
    
    presetsListBtn.style.display = presets.length > 0 ? 'inline-block' : 'none';
}

function saveSettings() {
    localStorage.setItem('frequency', frequency.toString());
    localStorage.setItem('amplitude', amplitude.toString());
}

function loadSettings() {
    frequency = parseInt(localStorage.getItem('frequency')) || 440;
    amplitude = parseInt(localStorage.getItem('amplitude')) || 100;
    document.getElementById('frequency-slider').value = frequency;
    document.getElementById('frequency-value').textContent = frequency;
    document.getElementById('amplitude-slider').value = amplitude;
    document.getElementById('amplitude-value').textContent = amplitude;
}

// Обработчики событий для слайдеров с debounce
const debouncedSaveSettings = debounce(saveSettings, 300);

const frequencySlider = document.getElementById('frequency-slider');
const amplitudeSlider = document.getElementById('amplitude-slider');

frequencySlider.addEventListener('input', function() {
    frequency = parseInt(this.value);
    document.getElementById('frequency-value').textContent = frequency;
    debouncedSaveSettings();
});

amplitudeSlider.addEventListener('input', function() {
    amplitude = parseInt(this.value);
    document.getElementById('amplitude-value').textContent = amplitude;
    debouncedSaveSettings();
});

function savePreset(name) {
    const preset = {
        name: name,
        frequency: frequency,
        amplitude: amplitude
    };
    presets.push(preset);
    localStorage.setItem('soundWavePresets', JSON.stringify(presets));
    renderPresetsList();
}

function loadPreset(index) {
    if (index >= 0 && index < presets.length) {
        const preset = presets[index];
        frequency = preset.frequency;
        amplitude = preset.amplitude;
        document.getElementById('frequency-slider').value = frequency;
        document.getElementById('frequency-value').textContent = frequency;
        document.getElementById('amplitude-slider').value = amplitude;
        document.getElementById('amplitude-value').textContent = amplitude;
        showErrorModal('Success', 'Preset loaded successfully!');
    } else {
        showErrorModal('Error', 'No preset selected.');
    }
}

// Обработка кнопок и модальных окон
const generateBtn = document.getElementById('generate-btn');
const savePresetBtn = document.getElementById('save-preset-btn');
const savePresetConfirmBtn = document.getElementById('save-preset-confirm-btn');
const loadPresetBtn = document.getElementById('load-preset-btn');
const randomWaveBtn = document.getElementById('random-wave-btn');
const fileInput = document.getElementById('file-input');

// Обработчик для кнопки генерации
generateBtn.addEventListener('click', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    showPreloader();
    setTimeout(() => {
        hidePreloader();
        loadingOverlay.style.display = 'none';
    }, 1000);
});

// Обработчик для кнопки сохранения шаблона
savePresetBtn.addEventListener('click', function() {
    openModal();
    document.getElementById('modal-title').textContent = 'Save Preset';
    document.getElementById('preset-name-input').value = '';
    document.getElementById('preset-name-input').focus();
});

// Обработчик для кнопки подтверждения сохранения
savePresetConfirmBtn.addEventListener('click', function() {
    const presetName = document.getElementById('preset-name-input').value.trim();
    if (presetName) {
        savePreset(presetName);
        closeModal();
    } else {
        showErrorModal('Error', 'Please enter a name for the preset.');
    }
});

// Обработчик закрытия модального окна по нажатию Enter
const presetNameInput = document.getElementById('preset-name-input');
presetNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const presetName = this.value.trim();
        if (presetName) {
            savePreset(presetName);
            closeModal();
        } else {
            showErrorModal('Error', 'Please enter a name for the preset.');
        }
    }
});

// Обработчик для кнопки загрузки шаблона
loadPresetBtn.addEventListener('click', function() {
    if (presets.length > 0) {
        const presetIndex = prompt(`Select a preset (0-${presets.length - 1}):`);
        const index = parseInt(presetIndex);
        loadPreset(index);
    } else {
        alert('No presets saved.');
    }
});

// Обработчик для кнопки генерации случайной волны
randomWaveBtn.addEventListener('click', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 1000);
});

// Обработка загрузки файла
fileInput.addEventListener('change', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const file = this.files[0];
    
    if (!file) {
        showErrorModal('Error', 'No file selected.');
        return;
    }
    
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp3'];
    if (!validTypes.includes(file.type)) {
        showErrorModal('Error', 'Unsupported audio file type. Please select MP3, WAV, OGG, or AAC.');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showErrorModal('Error', 'File size exceeds 10 MB.');
        return;
    }
    
    loadingOverlay.style.display = 'flex';
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 1000);
});

// Инициализация звука
let buttonClickSound;

// audio_generator.js (часть 2)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext;
let oscillator;
let gainNode;
let progressInterval;

const settings = {
    frequency: 440,      // Частота (Гц)
    amplitude: 0.5,     // Амплитуда
    waveType: 'sine',   // Тип волны: 'sine', 'square', 'sawtooth', 'triangle'
    isPlaying: false   // Состояние воспроизведения
};

function initAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
}

function generateSound(progressCallback) {
    if (settings.isPlaying) return;
    
    initAudioContext();
    
    if (oscillator) oscillator.disconnect();
    if (gainNode) gainNode.disconnect();
    
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    
    oscillator.type = settings.waveType;
    oscillator.frequency.value = settings.frequency;
    oscillator.connect(gainNode);
    gainNode.gain.value = settings.amplitude;
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    settings.isPlaying = true;
    
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += 5;
        if (progressCallback) {
            progressCallback(progress);
        }
        if (progress >= 100) {
            clearInterval(progressInterval);
            oscillator.stop(audioContext.currentTime + 2);
            settings.isPlaying = false;
        }
    }, 1000);
}

function stopSound() {
    if (settings.isPlaying && oscillator) {
        oscillator.stop();
        settings.isPlaying = false;
    }
    if (progressInterval) {
        clearInterval(progressInterval);
    }
}

function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    if (settings.isPlaying) {
        stopSound();
    }
    generateSound();
}

// wave_renderer.js (часть 3)
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
    
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.log('Режим с минимальными анимациями выбран. Анимация волны отключена.');
            pauseAnimation();
            const reducedMotionNotice = document.getElementById('reducedMotionNotice');
            if (reducedMotionNotice) {
                reducedMotionNotice.style.display = 'block';
            }
        }
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('AudioContext initialization failed:', error);
            alert('Отключено воспроизведение аудио. Проверьте разрешение на доступ к аудио в настройках браузера.');
            return;
        }
        
        if (!canvas || !ctx) {
            console.error('Canvas is not initialized.');
            return;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
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
    
    function generateSamples() {
        if (frequency === cachedFrequency && amplitude === cachedAmplitude && cachedSamples.length > 0) {
            samples = [...cachedSamples];
            return;
        }
        
        cachedFrequency = frequency;
        cachedAmplitude = amplitude;
        samples = [];
        const step = (2 * Math.PI) / sampleCount;
        for (let i = 0; i < sampleCount; i++) {
            const x = i * step;
            samples.push(amplitude * Math.sin(x) * 0.5 + 0.5);
        }
        cachedSamples = [...samples];
    }
    
    function renderWave() {
        if (!canvas || !ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        
        let currentSampleCount = sampleCount;
        if (window.matchMedia('(max-width: 600px)').matches) {
            currentSampleCount = Math.max(1000, Math.floor(sampleCount / 2));
        }
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        const sampleWidth = width / currentSampleCount;
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < currentSampleCount; i++) {
            const x = i * sampleWidth;
            const y = height / 2 - samples[i] * height / 2;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }
    
    function updateWave() {
        if (!canvas || !ctx) {
            console.error('Canvas or context is not initialized.');
            return;
        }
        generateSamples();
        renderWave();
        animationId = requestAnimationFrame(updateWave);
    }
    
    function pauseAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    function setFrequency(newFrequency) {
        frequency = newFrequency;
        if (oscillator) {
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        }
        saveSettings();
        triggerWaveTransition();
        playSoundEffect();
    }
    
    function setAmplitude(newAmplitude) {
        amplitude = newAmplitude;
        if (gainNode) {
            gainNode.gain.value = amplitude;
        }
        saveSettings();
        updateWaveColor();
        triggerWaveTransition();
        playSoundEffect();
    }
    
    function updateWaveColor() {
        if (frequency > 2000) {
            waveColor = '#2196F3'; // Синий для высоких частот
        } else if (frequency > 1000) {
            waveColor = '#4CAF50'; // Зелёный для средних частот
        } else {
            waveColor = '#FF5722'; // Оранжевый для низких частот
        }
        
        const canvas = document.getElementById('wave-canvas');
        if (canvas) {
            canvas.classList.add('wave-color-transition');
            setTimeout(() => {
                canvas.classList.remove('wave-color-transition');
            }, 500);
        }
    }
    
    function triggerWaveTransition() {
        const canvas = document.getElementById('wave-canvas');
        if (canvas) {
            canvas.classList.add('wave-transition');
            setTimeout(() => {
                canvas.classList.remove('wave-transition', 'active');
                setTimeout(() => {
                    canvas.classList.remove('wave-transition', 'active');
                }, 500);
            }, 500);
        }
    }
    
    function saveSettings() {
        const settings = {
            frequency: frequency,
            amplitude: amplitude
        };
        localStorage.setItem('waveSettings', JSON.stringify(settings));
    }
    
    function loadSettings() {
        const savedSettings = localStorage.getItem('waveSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            frequency = settings.frequency || 440;
            amplitude = settings.amplitude || 0.5;
            if (gainNode) {
                gainNode.gain.value = amplitude;
            }
            if (oscillator && audioContext) {
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            }
        }
    }
    
    return {
        init,
        updateWave,
        pauseAnimation,
        setFrequency,
        setAmplitude,
    };
}();

// Инициализация и основная логика
// Загрузка настроек
loadSettings();

// Инициализация WaveRenderer
const waveRenderer = WaveRenderer;
waveRenderer.init('wave-canvas');

// Инициализация клавиатурной навигации
setupKeyboardNavigation();

// Инициализация звука
// Обработка нажатия кнопок
generateBtn.addEventListener('click', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    showPreloader();
    
    // Генерация звука
    generateSound((progress) => {
        document.getElementById('progress-bar').style.width = `${progress}%`;
    });
    
    setTimeout(() => {
        hidePreloader();
        loadingOverlay.style.display = 'none';
    }, 2000);
});

// Функции для модального окна
function openModal() {
    const modal = document.getElementById('preset-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('preset-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Инициализация звука при загрузке
window.updateSettings = updateSettings;
window.generateSound = generateSound;
window.stopSound = stopSound;

// Подключение обработчиков для слайдеров
frequencySlider.addEventListener('input', function() {
    waveRenderer.setFrequency(parseInt(this.value));
});

amplitudeSlider.addEventListener('input', function() {
    waveRenderer.setAmplitude(parseInt(this.value) / 100);
});

// Инициализация для экспорта
const exportWaveBtn = document.getElementById('export-wave-btn');
const exportWaveImageBtn = document.getElementById('export-wave-image-btn');

exportWaveBtn.addEventListener('click', waveRenderer.exportWave);
exportWaveImageBtn.addEventListener('click', waveRenderer.exportWaveImage);