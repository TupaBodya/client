// Конфигурация приложения
export const APP_CONFIG = {
  NAME: 'Карта БГИТУ',
  VERSION: '2.0.0',
  DESCRIPTION: 'Интерактивная карта Брянского государственного инженерно-технологического университета',
  SUPPORT_EMAIL: 'support@bgitumap.ru',
  THEME: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  VIEW_MODES: {
    '2D': '2d',
    '3D': '3d'
  }
};

// Конфигурация карты
export const MAP_CONFIG = {
  MAX_ZOOM: 5,
  MIN_ZOOM: 0.5,
  INITIAL_ZOOM: 0.6,
  ANIMATION_DURATION: 300,
  PANZOOM: {
    MAX_ZOOM: 5,
    MIN_ZOOM: 0.5,
    BOUNDS: true,
    BOUNDS_PADDING: 0.6
  }
};

// Конфигурация API
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.bgitumap.ru' 
    : 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут
  ENDPOINTS: {
    AUDIENCES: '/api/audiences',
    SEARCH: '/api/audiences/search',
    SCHEDULE: '/api/schedule',
    TEACHERS: '/api/teachers',
    GROUPS: '/api/groups',
    ANALYTICS: '/api/analytics'
  }
};

// Конфигурация 3D
export const THREE_CONFIG = {
  CAMERA: {
    FOV: 20,
    NEAR: 0.1,
    FAR: 1000,
    INITIAL_POSITION: { x: 0, y: 15, z: 20 }
  },
  CONTROLS: {
    ENABLE_DAMPING: true,
    DAMPING_FACTOR: 0.05,
    MIN_DISTANCE: 4,
    MAX_DISTANCE: 25,
    MIN_POLAR_ANGLE: 0,
    MAX_POLAR_ANGLE: Math.PI * 0.8
  },
  LIGHTING: {
    AMBIENT: {
      COLOR: 0xffffff,
      INTENSITY: 0.8
    },
    DIRECTIONAL: {
      COLOR: 0xffffff,
      INTENSITY: 1.2,
      POSITION: { x: 15, y: 25, z: 15 },
      SHADOW: {
        MAP_SIZE: 2048,
        CAMERA: {
          NEAR: 0.5,
          FAR: 50,
          LEFT: -20,
          RIGHT: 20,
          TOP: 20,
          BOTTOM: -20
        }
      }
    }
  },
  OPTIMIZATION: {
    LOD_DISTANCES: [0, 10, 25],
    MAX_PIXEL_RATIO: 2,
    SHADOW_QUALITY: 'medium' // 'low', 'medium', 'high'
  }
};

// Конфигурация аналитики
export const ANALYTICS_CONFIG = {
  ENABLED: process.env.NODE_ENV === 'production',
  SAMPLE_RATE: 1.0, // 100% событий
  ENDPOINTS: {
    TRACK: '/api/analytics/track',
    BATCH: '/api/analytics/batch',
    PERFORMANCE: '/api/analytics/performance'
  },
  EVENT_TYPES: {
    PAGE_VIEW: 'page_view',
    SEARCH: 'search',
    NAVIGATION: 'navigation',
    ERROR: 'error',
    PERFORMANCE: 'performance'
  }
};

// Конфигурация PWA
export const PWA_CONFIG = {
  ENABLED: true,
  CACHE: {
    NAME: 'bgitumap-cache-v2',
    STRATEGIES: {
      NETWORK_FIRST: [
        '/api/audiences',
        '/api/schedule',
        '/api/teachers'
      ],
      CACHE_FIRST: [
        '/img/',
        '/models/',
        '/css/',
        '/js/'
      ],
      STALE_WHILE_REVALIDATE: [
        '/api/search'
      ]
    }
  },
  OFFLINE: {
    ENABLED: true,
    FALLBACK_PAGE: '/offline.html'
  }
};

// Конфигурация QR сканера
export const QR_CONFIG = {
  SCANNER: {
    FPS: 10,
    QR_BOX: { width: 250, height: 250 },
    SUPPORTED_FORMATS: [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.AZTEC,
      Html5QrcodeSupportedFormats.CODABAR
    ]
  },
  GENERATION: {
    SIZE: 200,
    MARGIN: 2,
    COLOR: {
      DARK: '#000000',
      LIGHT: '#ffffff'
    }
  }
};

// Конфигурация уведомлений
export const NOTIFICATION_CONFIG = {
  TIMEOUT: 5000,
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  },
  POSITIONS: {
    TOP: 'top',
    BOTTOM: 'bottom'
  }
};

// Экспорт по умолчанию
export default {
  APP: APP_CONFIG,
  MAP: MAP_CONFIG,
  API: API_CONFIG,
  THREE: THREE_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  PWA: PWA_CONFIG,
  QR: QR_CONFIG,
  NOTIFICATION: NOTIFICATION_CONFIG
};