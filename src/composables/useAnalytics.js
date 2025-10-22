import { ref } from 'vue';
import axios from 'axios';

export function useAnalytics() {
  const sessionId = ref(generateSessionId());
  const pageLoadTime = ref(0);

  // Генерация ID сессии
  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Отслеживание событий
  const trackEvent = async (eventName, eventData = {}) => {
    const event = {
      sessionId: sessionId.value,
      eventName,
      eventData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      language: navigator.language
    };

    try {
      // Отправка на сервер
      await axios.post('/api/analytics/track', event, {
        timeout: 5000
      });
    } catch (error) {
      // Резервное сохранение в localStorage
      saveEventToLocalStorage(event);
      console.warn('Analytics event saved locally:', eventName);
    }

    // Логирование в консоль в development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventName, eventData);
    }
  };

  // Отслеживание производительности
  const trackPerformance = async (metricName, value, additionalData = {}) => {
    await trackEvent('performance_metric', {
      metricName,
      value,
      ...additionalData
    });
  };

  // Отслеживание ошибок
  const trackError = async (error, context = '') => {
    await trackEvent('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  };

  // Отслеживание навигации
  const trackNavigation = async (from, to) => {
    await trackEvent('navigation', {
      from,
      to,
      timestamp: new Date().toISOString()
    });
  };

  // Отслеживание времени загрузки страницы
  const trackPageLoad = () => {
    pageLoadTime.value = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - pageLoadTime.value;
      trackPerformance('page_load_time', loadTime);
    });
  };

  // Резервное сохранение в localStorage
  const saveEventToLocalStorage = (event) => {
    try {
      const pendingEvents = JSON.parse(localStorage.getItem('pendingAnalyticsEvents') || '[]');
      pendingEvents.push(event);
      
      // Ограничиваем размер
      if (pendingEvents.length > 50) {
        pendingEvents.splice(0, pendingEvents.length - 50);
      }
      
      localStorage.setItem('pendingAnalyticsEvents', JSON.stringify(pendingEvents));
    } catch (error) {
      console.error('Failed to save analytics event locally:', error);
    }
  };

  // Отправка отложенных событий
  const sendPendingEvents = async () => {
    try {
      const pendingEvents = JSON.parse(localStorage.getItem('pendingAnalyticsEvents') || '[]');
      
      if (pendingEvents.length > 0) {
        await axios.post('/api/analytics/batch', {
          events: pendingEvents
        });
        
        // Очищаем после успешной отправки
        localStorage.removeItem('pendingAnalyticsEvents');
      }
    } catch (error) {
      console.error('Failed to send pending analytics events:', error);
    }
  };

  // Инициализация
  const initAnalytics = () => {
    trackPageLoad();
    trackEvent('session_start');
    
    // Периодическая отправка отложенных событий
    setInterval(sendPendingEvents, 30000); // Каждые 30 секунд
    
    // Отслеживание видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackEvent('page_hidden');
      } else {
        trackEvent('page_visible');
      }
    });
  };

  return {
    trackEvent,
    trackPerformance,
    trackError,
    trackNavigation,
    initAnalytics,
    sendPendingEvents
  };
}