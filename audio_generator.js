// audio_generator.js
// Генерация звука на основе настроек волны

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Настройки по умолчанию
let settings = {
    frequency: 440,      // Частота (Гц)
    amplitude: 0.5,     // Амплитуда
    waveType: 'sine'    // Тип волны: 'sine', 'square', 'sawtooth', 'triangle'
};

// Генерация звука
function generateSound(progressCallback) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = settings.waveType;
    oscillator.frequency.value = settings.frequency;
    oscillator.connect(gainNode);
    gainNode.gain.value = settings.amplitude;
    gainNode.connect(audioContext.destination);

    oscillator.start();
    
    // Симуляция прогресса загрузки волны
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progressCallback) {
            progressCallback(progress);
        }
        if (progress >= 100) {
            clearInterval(interval);
            oscillator.stop(audioContext.currentTime + 5); // Звук длится 5 секунд
        }
    }, 500);
}

// Обновление настроек
function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    generateSound();
}

// Объявление функций глобально
window.updateSettings = updateSettings;
window.generateSound = generateSound;