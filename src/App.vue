<template>
  <router-view/>
</template>

<style>
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --success-color: #4cc9f0;
  --warning-color: #f72585;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
  
  /* Мобильные переменные */
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
  --safe-area-inset-right: env(safe-area-inset-right);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  font-size: 16px;
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  color: var(--dark-color);
  height: 100%;
  overflow-x: hidden;
  position: relative;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  width: 100%;
  position: relative;
}

.app-container {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

/* Улучшенная поддержка мобильных устройств */
button, 
input, 
select, 
textarea {
  font-family: inherit;
  font-size: inherit;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0;
}

button {
  cursor: pointer;
  transition: var(--transition);
  touch-action: manipulation;
}

input, select, textarea {
  font-size: 16px; /* Предотвращает масштабирование в iOS */
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse {
  animation: pulse 1.5s infinite;
}

/* Медиа-запросы для адаптивности */
@media (max-width: 480px) {
  html {
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  html {
    font-size: 13px;
  }
}

/* Поддержка устройств с вырезом (notch) */
@supports(padding: max(0px)) {
  .app-container {
    padding-left: min(0px, env(safe-area-inset-left));
    padding-right: min(0px, env(safe-area-inset-right));
    padding-top: min(0px, env(safe-area-inset-top));
    padding-bottom: min(0px, env(safe-area-inset-bottom));
  }
}

/* Улучшение производительности на мобильных */
* {
  -webkit-overflow-scrolling: touch;
}

/* Предотвращение выделения текста при тапе */
.no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Оптимизация для медленных соединений */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>