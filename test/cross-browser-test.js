// ===== Кросс-браузерное тестирование Sound Wave Generator ====
// Проверка Web Audio API и адаптивности UI

// --- Проверка Web Audio API ---
function testWebAudioAPI() {
  try {
    if (!window.AudioContext && !window.webkitAudioContext) {
      throw new Error("Web Audio API не поддерживается!");
    }
    console.log("✅ Web Audio API поддерживается.");
    return true;
  } catch (e) {
    console.error("❌ Ошибка Web Audio API:", e.message);
    return false;
  }
}

// --- Проверка адаптивности UI ---
function testResponsiveUI() {
  const viewportWidth = window.innerWidth;
  const isMobile = viewportWidth <= 768;
  const isDesktop = viewportWidth > 1024;

  if (isMobile) {
    console.log("📱 Тестирование на мобильном устройстве.");
    // Проверка элементов UI для мобильного режима
    const mobileElements = document.querySelectorAll(".mobile-only");
    if (mobileElements.length > 0) {
      console.log("✅ Элементы для мобильного режима найдены.");
    } else {
      console.warn("⚠️ Отсутствуют элементы для мобильного режима.");
    }
  } else if (isDesktop) {
    console.log("💻 Тестирование на десктопе.");
    // Проверка элементов UI для десктопа
    const desktopElements = document.querySelectorAll(".desktop-only");
    if (desktopElements.length > 0) {
      console.log("✅ Элементы для десктопа найдены.");
    } else {
      console.warn("⚠️ Отсутствуют элементы для десктопа.");
    }
  }
}

// --- Основной скрипт ---
console.log("🔍 Запуск кросс-браузерного тестирования...");

// Проверка Web Audio API
const webAudioSupported = testWebAudioAPI();

// Проверка адаптивности UI
testResponsiveUI();

// --- Отчёт ---
console.log("\n=== РЕЗУЛЬТАТЫ ===");
console.log("Web Audio API:", webAudioSupported ? "✅ Работает" : "❌ Не работает");
console.log("Адаптивность UI:", 
  (window.innerWidth <= 768 ? "✅ Мобильный режим" : "❌ Нет мобильного режима"));

// Вызов функции при изменении размера окна (для адаптивности)
window.addEventListener("resize", testResponsiveUI);