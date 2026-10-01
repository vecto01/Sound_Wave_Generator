document.addEventListener('DOMContentLoaded', () => {
  const testSettings = {
    frequency: 440,
    amplitude: 0.8,
    color: '#ff0000'
  };

  // Сохраняем тестовые настройки
  localStorage.setItem('soundWaveSettings', JSON.stringify(testSettings));

  // Проверяем сохранение
  const savedSettings = JSON.parse(localStorage.getItem('soundWaveSettings'));
  console.log('Сохранённые настройки:', savedSettings);

  // Проверяем корректность
  if (savedSettings.frequency !== testSettings.frequency) {
    console.error('Ошибка: частота не сохранилась!');
  } else {
    console.log('✅ Частота успешно сохранена.');
  }

  if (savedSettings.amplitude !== testSettings.amplitude) {
    console.error('Ошибка: амплитуда не сохранилась!');
  } else {
    console.log('✅ Амплитуда успешно сохранена.');
  }

  if (savedSettings.color !== testSettings.color) {
    console.error('Ошибка: цвет не сохранился!');
  } else {
    console.log('✅ Цвет успешно сохранен.');
  }
});