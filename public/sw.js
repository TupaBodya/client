const CACHE_NAME = 'bgitumap-cache-v2';
const API_CACHE_NAME = 'bgitumap-api-cache-v1';

// Стратегии кэширования
const STRATEGIES = {
  NETWORK_FIRST: [
    '/api/audiences',
    '/api/schedule',
    '/api/teachers',
    '/api/groups'
  ],
  CACHE_FIRST: [
    '/img/',
    '/models/',
    '/css/',
    '/js/',
    '/fonts/'
  ],
  STALE_WHILE_REVALIDATE: [
    '/api/search',
    '/api/buffet-menu'
  ]
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/static/css/main.css',
          '/static/js/main.js',
          '/img/logo.jpg',
          '/img/default-avatar.png',
          '/offline.html'
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Пропускаем неподдерживаемые схемы
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleRequest(event.request).catch(() => {
      // Fallback для оффлайн режима
      if (event.request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
      return new Response('Network error happened', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});

// Обработка запросов
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // API запросы
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(request);
  }
  
  // Статические ресурсы
  if (STRATEGIES.CACHE_FIRST.some(path => url.pathname.startsWith(path))) {
    return handleCacheFirst(request);
  }
  
  // Страницы
  if (request.mode === 'navigate') {
    return handleNavigationRequest(request);
  }
  
  // По умолчанию - сеть сначала
  return fetch(request);
}

// Обработка API запросов
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Network First для критичных данных
  if (STRATEGIES.NETWORK_FIRST.some(path => url.pathname.startsWith(path))) {
    return handleNetworkFirst(request, API_CACHE_NAME);
  }
  
  // Stale While Revalidate для поиска
  if (STRATEGIES.STALE_WHILE_REVALIDATE.some(path => url.pathname.startsWith(path))) {
    return handleStaleWhileRevalidate(request, API_CACHE_NAME);
  }
  
  // По умолчанию - сеть
  return fetch(request);
}

// Стратегия Network First
async function handleNetworkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Стратегия Cache First
async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Стратегия Stale While Revalidate
async function handleStaleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Независимо обновляем кэш в фоне
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
  }).catch(() => {}); // Игнорируем ошибки фонового обновления
  
  // Возвращаем кэшированный ответ или ждем сетевой
  if (cachedResponse) {
    return cachedResponse;
  }
  
  return await fetchPromise.then(() => fetch(request));
}

// Обработка навигационных запросов
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback для оффлайн страницы
    return caches.match('/offline.html');
  }
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
}