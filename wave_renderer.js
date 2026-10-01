// ============================================= 
// Wave Renderer: Optimized with requestAnimationFrame
// ============================================= 

const WaveRenderer = (() => {
    let canvas;
    let ctx;
    let audioContext;
    let oscillator;
    let gainNode;
    let animationId;
    let frequency = 440;
    let amplitude = 0.5;
    let samples = [];
    let sampleCount = 44100; // 1 second of audio at 44.1kHz
    
    // Initialize the canvas
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        // Проверка prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.log('Режим с минимальными анимациями выбран. Анимация волны отключена.');
            pauseAnimation();
        }
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error("AudioContext initialization failed:", error);
            alert("Отключено воспроизведение аудио. Проверьте разрешение на доступ к аудио в настройках браузера.");
            return;
        }
        
        // Обработка ошибок при инициализации canvas
        if (!canvas || !ctx) {
            console.error("Canvas is not initialized.");
            return;
        }
        
        // Set canvas size
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    // Resize canvas to fit its display size
    function resizeCanvas() {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            renderWave();
        }
    }
    
    // Start audio oscillator
    function startOscillator() {
        if (!audioContext) {
            console.error("AudioContext is not initialized.");
            return;
        }
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        gainNode.gain.value = amplitude;
    }
    
    // Stop audio oscillator
    function stopOscillator() {
        if (oscillator) {
            oscillator.stop();
            oscillator = null;
        }
    }
    
    // Кэширование текущих параметров для оптимизации
    let cachedFrequency = frequency;
    let cachedAmplitude = amplitude;
    let cachedSamples = [];
    
    // Generate wave samples (с кэшированием)
    function generateSamples() {
        if (frequency === cachedFrequency && amplitude === cachedAmplitude && cachedSamples.length > 0) {
            samples = [...cachedSamples]; // Возвращаем кэшированные образцы
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
        cachedSamples = [...samples]; // Сохраняем кэш
    }
    
    // Render wave on canvas (оптимизированный рендеринг)
    function renderWave() {
        if (!canvas || !ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const sampleWidth = width / sampleCount;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw wave
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < sampleCount; i++) {
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
    
    // Update wave with requestAnimationFrame
    function updateWave() {
        if (!canvas || !ctx) {
            console.error("Canvas or context is not initialized.");
            return;
        }
        generateSamples();
        renderWave();
        animationId = requestAnimationFrame(updateWave);
    }
    
    // Pause animation
    function pauseAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    // Set frequency and amplitude
    function setFrequency(newFrequency) {
        frequency = newFrequency;
        if (oscillator) {
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        }
        saveSettings();
    }
    
    function setAmplitude(newAmplitude) {
        amplitude = newAmplitude;
        if (gainNode) {
            gainNode.gain.value = amplitude;
        }
        saveSettings();
    }
    
    // Save settings to localStorage
    function saveSettings() {
        const settings = {
            frequency: frequency,
            amplitude: amplitude
        };
        localStorage.setItem('waveSettings', JSON.stringify(settings));
    }
    
    // Load settings from localStorage
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
    
    // Export wave as WAV (without external library)
    function exportWave() {
        try {
            if (!audioContext || !samples || samples.length === 0) {
                console.error("AudioContext or samples not initialized.");
                alert("Не удалось экспортировать волну. Проверьте настройки или перезагрузите страницу.");
                return;
            }
            
            // Create a buffer for the audio data
            const audioBuffer = audioContext.createBuffer(1, sampleCount, audioContext.sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            // Fill channel data with generated samples
            for (let i = 0; i < sampleCount; i++) {
                channelData[i] = samples[i] * 0.9; // Normalize
            }
            
            // Create a WAV header manually
            const wavHeader = createWavHeader(sampleCount, 1, audioContext.sampleRate);
            
            // Combine header and audio data
            const audioData = new Uint8Array(wavHeader.length + sampleCount * 2);
            audioData.set(new Uint8Array(wavHeader), 0);
            
            // Convert samples to 16-bit PCM
            for (let i = 0; i < sampleCount; i++) {
                const sample = Math.max(-1, Math.min(1, samples[i]));
                const value = sample * 32767; // Convert to 16-bit range
                audioData[wavHeader.length + i * 2] = value & 0xff;
                audioData[wavHeader.length + i * 2 + 1] = (value >> 8) & 0xff;
            }
        } catch (error) {
            console.error("Error during export:", error);
            alert("Ошибка экспорта волны. Проверьте настройки или перезагрузите страницу.");
            return;
        }
        
        // Create a Blob with the WAV data
        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wave_output.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        document.body.removeChild(a);
    }
    
    // Create a WAV header
    function createWavHeader(sampleCount, channelCount, sampleRate) {
        const bytesPerSample = 2;
        const byteRate = sampleRate * channelCount * bytesPerSample;
        const dataSize = sampleCount * channelCount * bytesPerSample;
        
        const header = new Uint8Array(44);
        
        // RIFF header
        header.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
        header[4] = (36 + dataSize) & 0xff;
        header[5] = ((36 + dataSize) >> 8) & 0xff;
        header[6] = ((36 + dataSize) >> 16) & 0xff;
        header[7] = ((36 + dataSize) >> 24) & 0xff;
        
        // WAVE header
        header.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
        
        // fmt sub-chunk
        header.set([0x66, 0x6d, 0x74, 0x20], 12); // fmt 
        header[16] = 16; // Sub-chunk size
        header[18] = 1; // Audio format (PCM)
        header[19] = channelCount;
        header[20] = (sampleRate) & 0xff;
        header[21] = ((sampleRate) >> 8) & 0xff;
        header[22] = ((sampleRate) >> 16) & 0xff;
        header[23] = ((sampleRate) >> 24) & 0xff;
        header[24] = (byteRate) & 0xff;
        header[25] = ((byteRate) >> 8) & 0xff;
        header[26] = ((byteRate) >> 16) & 0xff;
        header[27] = ((byteRate) >> 24) & 0xff;
        header[28] = (channelCount * bytesPerSample) & 0xff;
        header[29] = (channelCount * bytesPerSample) >> 8;
        
        // data sub-chunk
        header.set([0x64, 0x61, 0x74, 0x61], 20); // data
        header[24] = (dataSize) & 0xff;
        header[25] = ((dataSize) >> 8) & 0xff;
        header[26] = ((dataSize) >> 16) & 0xff;
        header[27] = ((dataSize) >> 24) & 0xff;
        
        return header;
    }
    
    // Initialize WaveRenderer
    // Export wave image as PNG
    function exportWaveImage() {
        if (!canvas) {
            console.error("Canvas is not initialized.");
            return;
        }
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error("Failed to create blob.");
                return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'wave_image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png', 1);
    }
    
    return {
        init,
        startOscillator,
        stopOscillator,
        updateWave,
        pauseAnimation,
        setFrequency,
        setAmplitude,
        exportWave,
        exportWaveImage,
    };
})();