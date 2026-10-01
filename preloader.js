class WavePreloader {
    constructor() {
        this.waveLoading = document.getElementById('waveLoading');
        this.isVisible = true;
    }

    show() {
        if (!this.waveLoading) return;
        this.waveLoading.classList.add('active');
    }

    hide() {
        if (!this.waveLoading) return;
        this.waveLoading.classList.remove('active');
        this.waveLoading.setAttribute('aria-live', 'polite');
        this.waveLoading.innerHTML = '<p>Wave generated successfully!</p>';
        setTimeout(() => {
            this.waveLoading.innerHTML = '';
        }, 2000);
    }
}

// Инициализация
const wavePreloader = new WavePreloader();

// Показываем прелоадер при инициализации
wavePreloader.show();

// Скрываем прелоадер после завершения генерации волны
waveWorker.onmessage = function(e) {
    if (e.data.type === 'complete') {
        wavePreloader.hide();
        document.querySelector('.wave-container').classList.add('success');
        document.getElementById('waveLoadingContainer').classList.add('loaded');
    }
};

// Инициализация
const preloader = new Preloader();

// Показываем прелоадер при загрузке
preloader.show();

// Скрываем прелоадер после загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(preloader.hide, 2000); // Задержка для демонстрации
});