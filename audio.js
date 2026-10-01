// audio.js
// Инициализация звука

// Управление прелоадером
function showPreloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('active');
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.remove('active');
}

// Инициализация звука
let buttonClickSound;

// Сохранение и загрузка шаблонов
let presets = JSON.parse(localStorage.getItem('soundWavePresets')) || [];

function savePreset(name) {
    const preset = {
        frequency: frequency,
        amplitude: amplitude
    };
    presets.push(preset);
    localStorage.setItem('soundWavePresets', JSON.stringify(presets));
    alert(`Preset '${name}' saved successfully!`);
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
        alert(`Preset loaded successfully!`);
    } else {
        alert('No preset selected.');
    }
}

// Инициализация звука при загрузке страницы
function initAudio() {
    buttonClickSound = new Howler.Sound("https://assets.mixkit.co/sfx/preview/mixkit-click-201.mp3");
}

// Инициализация и обработчики
initAudio();

// Обработчики событий
const generateBtn = document.getElementById('generate-btn');
generateBtn.addEventListener('click', function() {
    showPreloader();
    // Логика генерации волны
    setTimeout(hidePreloader, 1000);
});

const savePresetBtn = document.getElementById('save-preset-btn');
const loadPresetBtn = document.getElementById('load-preset-btn');

// Обработчик для кнопки сохранения шаблона
savePresetBtn.addEventListener('click', function() {
    const presetName = prompt('Enter a name for the preset:');
    if (presetName) {
        savePreset(presetName);
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


const randomWaveBtn = document.getElementById('random-wave-btn');
randomWaveBtn.addEventListener('click', function() {
    showPreloader();
    // Логика генерации случайной волны
    setTimeout(hidePreloader, 1000);
});

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', function() {
    showPreloader();
    // Логика обработки загруженного файла
    setTimeout(hidePreloader, 1000);
});