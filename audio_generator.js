// audio_generator.js
// Оптимизированная генерация звука с учетом снижения CPU-загрузки

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext;
let oscillator;
let gainNode;
let progressInterval;

// Настройки по умолчанию
let settings = {
    frequency: 440,      // Частота (Гц)
    amplitude: 0.5,     // Амплитуда
    waveType: 'sine',   // Тип волны: 'sine', 'square', 'sawtooth', 'triangle'
    isPlaying: false   // Состояние воспроизведения
};

// Инициализация AudioContext
function initAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
}

// Генерация звука с оптимизацией
function generateSound(progressCallback) {
    if (settings.isPlaying) return; // Если уже воспроизводится, ничего не делать
    
    initAudioContext();
    
    // Очистка предыдущих узлов
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

    // Оптимизированный прогресс (обновление реже)
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += 5; // Уменьшено с 10 до 5 для снижения нагрузки
        if (progressCallback) {
            progressCallback(progress);
        }
        if (progress >= 100) {
            clearInterval(progressInterval);
            oscillator.stop(audioContext.currentTime + 2); // Звук длится 2 секунды
            settings.isPlaying = false;
        }
    }, 1000); // Увеличено с 500 до 1000 мс
}

// Остановка звука
function stopSound() {
    if (settings.isPlaying && oscillator) {
        oscillator.stop();
        settings.isPlaying = false;
    }
    if (progressInterval) {
        clearInterval(progressInterval);
    }
}

// Обновление настроек
function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    if (settings.isPlaying) {
        stopSound();
    }
    generateSound();
}

// Объявление функций глобально
window.updateSettings = updateSettings;
window.generateSound = generateSound;
window.stopSound = stopSound;