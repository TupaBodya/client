import { ref, onUnmounted } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import { useErrorHandler } from './useErrorHandler';
import { useAnalytics } from './useAnalytics';

export function useQRScanner() {
  const { handleError } = useErrorHandler();
  const { trackEvent } = useAnalytics();

  // Состояния
  const showQRScanner = ref(false);
  const qrScannerActive = ref(false);
  const qrScannerElement = ref(null);
  const qrScanner = ref(null);

  // Инициализация сканера
  const initQRScanner = async () => {
    if (!qrScannerElement.value) return;

    try {
      qrScanner.value = new Html5Qrcode(qrScannerElement.value.id);
      
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        const cameraId = cameras[0].id;
        
        await qrScanner.value.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          onQRCodeScanned,
          () => {} // Обработчик ошибок сканирования
        );
        
        qrScannerActive.value = true;
        trackEvent('qr_scanner_started');
      } else {
        throw new Error('Камеры не найдены');
      }
    } catch (error) {
      handleError(error, 'init_qr_scanner');
      stopQRScanner();
    }
  };

  // Обработка отсканированного QR-кода
  const onQRCodeScanned = (decodedText, decodedResult) => {
    trackEvent('qr_code_scanned', { decodedText });
    
    try {
      const qrData = JSON.parse(decodedText);
      handleQRCodeScanned(qrData);
      
      // Автоматическое закрытие сканера после успешного сканирования
      setTimeout(() => {
        closeQRScanner();
      }, 1000);
      
    } catch (error) {
      // Если это не JSON, пробуем обработать как URL с параметрами
      handleQRCodeFromURL(decodedText);
    }
  };

  // Обработка QR данных
  const handleQRCodeScanned = (qrData) => {
    if (qrData.type === 'audience') {
      // Эмитируем событие для основного компонента
      window.dispatchEvent(new CustomEvent('qr-audience-found', {
        detail: qrData
      }));
      
      showNotification(`Найдена аудитория ${qrData.audienceNumber}`, 'success');
    }
  };

  // Обработка QR из URL
  const handleQRCodeFromURL = (url) => {
    try {
      const urlObj = new URL(url);
      const qrData = urlObj.searchParams.get('data');
      
      if (qrData) {
        const parsedData = JSON.parse(decodeURIComponent(qrData));
        handleQRCodeScanned(parsedData);
      }
    } catch (error) {
      handleError(error, 'process_qr_url');
      showNotification('Неверный формат QR-кода', 'error');
    }
  };

  // Управление сканером
  const startQRScanner = async () => {
    try {
      await initQRScanner();
    } catch (error) {
      handleError(error, 'start_qr_scanner');
    }
  };

  const stopQRScanner = async () => {
    if (qrScanner.value && qrScannerActive.value) {
      try {
        await qrScanner.value.stop();
        qrScannerActive.value = false;
        trackEvent('qr_scanner_stopped');
      } catch (error) {
        console.error('Error stopping QR scanner:', error);
      }
    }
  };

  const toggleQRScanner = () => {
    if (showQRScanner.value) {
      closeQRScanner();
    } else {
      showQRScanner.value = true;
      // Даем время на рендеринг модального окна
      setTimeout(() => {
        startQRScanner();
      }, 300);
    }
  };

  const closeQRScanner = async () => {
    await stopQRScanner();
    showQRScanner.value = false;
    qrScannerActive.value = false;
  };

  // Уведомления
  const showNotification = (message, type = 'info') => {
    // Эмитируем событие для системы уведомлений
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { message, type }
    }));
  };

  // Очистка
  onUnmounted(async () => {
    await stopQRScanner();
  });

  return {
    // Состояния
    showQRScanner,
    qrScannerActive,
    qrScannerElement,

    // Методы
    toggleQRScanner,
    startQRScanner,
    closeQRScanner,
    handleQRCodeScanned
  };
}