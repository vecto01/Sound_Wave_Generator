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
let oscillator;
let gainNode;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

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

    analyzerNode = audioContext.createAnalyser();
    oscillator.connect(analyzerNode);
    analyzerNode.fftSize = 256;
    dataArray = new Uint8Array(analyzerNode.frequencyBinCount);

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

define drawWave(dataArray) {
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
    loadingIndicator = document.getElementById('loadingIndicator');
    loadingSpinner = document.getElementById('loadingSpinner');

    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }

    if (isSoundOnlyMode) {
        canvas.style.display = 'none';
        const soundOnlyLabel = document.getElementById('soundOnlyLabel');
        soundOnlyLabel.textContent = 'Visualization Disabled (Sound Only Mode)';
    } else {
        const soundOnlyLabel = document.getElementById('soundOnlyLabel');
        soundOnlyLabel.textContent = 'Enable Sound Only Mode';
    }

    initAudio();

    function updateSettingsDisplay() {
        const freqPercent = Math.round(frequency * 10);
        const ampPercent = Math.round(amplitude * 20);
        document.getElementById('frequencyValue').textContent = `${freqPercent} Hz`;
        document.getElementById('amplitudeValue').textContent = `${ampPercent}%`;
    }

    let targetFrequency = 0;
    let targetAmplitude = 0;

    function animateToTarget(target, current, duration = 500) {
        const startTime = performance.now();
        const startValue = current;
        const delta = target - startValue;

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = Math.pow(progress, 2);
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

    const clickSound = new Howl({
        src: ['assets/audio/click.wav']
    });

    const loadingSound = new Howl({
        src: ['assets/audio/loading.wav']
    });

    document.getElementById('generateBtn').addEventListener('click', function() {
        if (isGenerating) return;

        isGenerating = true;
        loadingIndicator.style.display = 'flex';
        loadingSpinner.style.display = 'block';
        loadingSound.play();

        function animateLoading() {
            if (!isGenerating) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const waveHeight = canvas.height / 2;
            const barWidth = (canvas.width / 256) * 2;
            const progress = Math.min(time / 500, 1);

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
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const finalWaveHeight = canvas.height / 2;
                const finalBarWidth = (canvas.width / 256) * 2;
                
                ctx.beginPath();
                ctx.moveTo(0, finalWaveHeight);
                for (let i = 0; i < 256; i++) {
                    const x = i * finalBarWidth;
                    const y = finalWaveHeight - dataArray[i] * finalWaveHeight / 200;
                    ctx.lineTo(x, y);
                }
                ctx.strokeStyle = '#4a90e2';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                const successSound = new Howl({
                    src: ['assets/audio/success.wav']
                });
                try {
                    successSound.play();
                } catch (e) {
                    console.log('Sound playback failed, continuing with UI feedback');
                }
                
                const generateBtn = document.getElementById('generateBtn');
                generateBtn.classList.add('button-fade-in active');
                generateBtn.textContent = 'Success!';
                
                setTimeout(() => {
                    generateBtn.classList.remove('button-fade-in active');
                    generateBtn.textContent = 'Generate Wave';
                }, 2000);
            }
        }
        animateLoading();
    });

    document.getElementById('frequencySlider').addEventListener('input', function() {
        targetFrequency = this.value;
        animateToTarget(targetFrequency, frequency);
    });

    document.getElementById('amplitudeSlider').addEventListener('input', function() {
        targetAmplitude = this.value;
        animateToTarget(targetAmplitude, amplitude);
    });

    document.getElementById('toggleTheme').addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('soundWaveSettings', JSON.stringify(settings));
        clickSound.play();
    });

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

    updateSettingsDisplay();
});