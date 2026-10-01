//! function checkBrowserCompatibility() {
  const features = {
    'css-animations': 'CSS Animations',
    'requestAnimationFrame': 'requestAnimationFrame',
    'localStorage': 'localStorage',
    'flexbox': 'Flexbox',
    'grid': 'CSS Grid',
    'touch-events': 'Touch Events'
  };

  // Проверка поддержки каждого фейтура
  const checkFeature = (feature) => {
    try {
      if (feature === 'localStorage') {
        return 'localStorage' in window && window.localStorage !== null;
      } else if (feature === 'requestAnimationFrame') {
        return 'requestAnimationFrame' in window;
      } else if (feature === 'CSS Animations') {
        return 'CSSAnimationEvent' in window;
      } else if (feature === 'Flexbox') {
        return 'flex' in document.documentElement.style;
      } else if (feature === 'CSS Grid') {
        return 'CSSGridLayout' in window;
      } else if (feature === 'Touch Events') {
        return 'ontouchstart' in window;
      }
    } catch (e) {
      return false;
    }
  };

  // Проверка всех фейтуров
  const results = {};
  for (const [feature, name] of Object.entries(features)) {
    results[name] = checkFeature(feature);
  }

  // Вывод результатов
  console.log('=== Browser Compatibility Check ===');
  for (const [name, supported] of Object.entries(results)) {
    console.log(`${name}: ${supported ? '✅ Supported' : '❌ Not Supported'}`);
  }

  return results;
}

// Запуск проверки
checkBrowserCompatibility();