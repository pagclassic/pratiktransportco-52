
const CACHE_NAME = 'transport-portal-v1';
const ASSETS_CACHE = 'assets-cache-v1';
const API_CACHE = 'api-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache basic files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, ASSETS_CACHE, API_CACHE].includes(cacheName)) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('api.supabase.co')) {
    return;
  }
  
  // API requests - network first, then cache
  if (event.request.url.includes('api.supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(API_CACHE).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Static assets - cache first, then network
  if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(networkResponse => {
          const clonedResponse = networkResponse.clone();
          caches.open(ASSETS_CACHE).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return networkResponse;
        });
      })
    );
    return;
  }
  
  // HTML pages - network first, then cache, then offline page
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the latest version
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If both network and cache fail for a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Push notification event
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Transport Portal';
  const options = {
    body: data.body || 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
