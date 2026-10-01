// audio.js

// Функция для задержки (debounce)
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Функция для навигации по элементам
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

// Обработка нажатия клавиш для клавиатурной навигации
function setupKeyboardNavigation() {
    const allTabbableElements = document.querySelectorAll('[tabindex="0"]');
    
    allTabbableElements.forEach(element => {
        element.addEventListener('keydown', function(event) {
            // Переход к следующему элементу при нажатии Tab
            if (event.key === 'Tab') {
                event.preventDefault();
                focusNextTabbableElement(this);
            }
            // Переход к предыдущему элементу при нажатии Shift+Tab
            else if (event.key === 'Tab' && event.shiftKey) {
                event.preventDefault();
                focusPrevTabbableElement(this);
            }
            // Выполнение действия по нажатию Enter для кнопок
            else if (event.key === 'Enter' && (this.tagName === 'BUTTON' || this.classList.contains('btn'))) {
                event.preventDefault();
                this.click();
            }
            // Закрытие модального окна при нажатии Escape
            else if (event.key === 'Escape' && document.getElementById('preset-modal').style.display === 'block') {
                event.preventDefault();
                closeModal();
            }
        });
    });
}
// Функции для модального окна
function showErrorModal(title, message) {
    const modal = document.getElementById('error-modal');
    const modalTitle = document.getElementById('error-modal-title');
    const modalMessage = document.getElementById('error-modal-message');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Запрет скроллинга
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Разрешение скроллинга
}

// Обработка закрытия модального окна по крестику
const closeErrorModalBtn = document.getElementById('close-error-modal');
closeErrorModalBtn.addEventListener('click', closeErrorModal);

// Обработка закрытия модального окна по нажатию на кнопку OK
const errorModalOkBtn = document.getElementById('error-modal-ok-btn');
errorModalOkBtn.addEventListener('click', closeErrorModal);

// Обработка закрытия модального окна по нажатию на фон
const errorModal = document.getElementById('error-modal');
errorModal.addEventListener('click', function(event) {
    if (event.target === errorModal) {
        closeErrorModal();
    }
});

// Функции для работы со списком шаблонов
function renderPresetsList() {
    const presetsList = document.getElementById('presets-list');
    const presetsListItems = document.getElementById('presets-list-items');
    const presetsListBtn = document.getElementById('presets-list-btn');
    
    // Очищаем список
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
    
    // Показываем кнопку списка, если есть шаблоны
    presetsListBtn.style.display = presets.length > 0 ? 'inline-block' : 'none';
}
// Инициализация звука
function initAudio() {
    buttonClickSound = new Howler.Sound("https://assets.mixkit.co/sfx/preview/mixkit-click-201.mp3");
    renderPresetsList();
}

// Функции для модального окна
function openModal() {
    const modal = document.getElementById('preset-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Запрет скроллинга при открытом модальном окне
}

function closeModal() {
    const modal = document.getElementById('preset-modal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Разрешение скроллинга
}

// Обработка закрытия модального окна по крестику
const closeBtn = document.getElementById('close-preset-modal');
closeBtn.addEventListener('click', closeModal);

// Обработка закрытия модального окна по нажатию на фон
modal.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Управление прелоадером
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

// Инициализация звука
let buttonClickSound;

// Сохранение и загрузка шаблонов
let presets = JSON.parse(localStorage.getItem('soundWavePresets')) || [];

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
    renderPresetsList(); // Обновляем список после сохранения
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

// Инициализация звука при загрузке страницы
function initAudio() {
    buttonClickSound = new Howler.Sound("https://assets.mixkit.co/sfx/preview/mixkit-click-201.mp3");
}

// Инициализация и обработчики
initAudio();

// Обработчики событий
const generateBtn = document.getElementById('generate-btn');


const savePresetConfirmBtn = document.getElementById('save-preset-confirm-btn');

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

// Обработчик закрытия модального окна при нажатии Enter
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
generateBtn.addEventListener('click', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    // Логика генерации волны
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 1000);
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
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    // Логика генерации случайной волны
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 1000);
});

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const file = this.files[0];
    
    // Проверка на наличие файла
    if (!file) {
        showErrorModal('Error', 'No file selected.');
        return;
    }
    
    // Проверка типа файла
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp3'];
    if (!validTypes.includes(file.type)) {
        showErrorModal('Error', 'Unsupported audio file type. Please select MP3, WAV, OGG, or AAC.');
        return;
    }
    
    // Проверка размера файла (например, до 10 МБ)
    const maxFileSize = 10 * 1024 * 1024; // 10 МБ
    if (file.size > maxFileSize) {
        showErrorModal('Error', 'File size exceeds 10 MB.');
        return;
    }
    
    loadingOverlay.style.display = 'flex';
    
    // Логика обработки загруженного файла
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 1000);
});

// Инициализация клавиатурной навигации
setupKeyboardNavigation();