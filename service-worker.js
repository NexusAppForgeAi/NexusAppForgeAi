// AppForge Service Worker
const CACHE_NAME = 'appforge-v1';
const urlsToCache = [
  '/NexusAppForgeAi/',
  '/NexusAppForgeAi/index.html',
  '/NexusAppForgeAi/css/main.css',
  '/NexusAppForgeAi/css/apk-builder.css',
  '/NexusAppForgeAi/css/syntax-highlight.css',
  '/NexusAppForgeAi/js/utils.js',
  '/NexusAppForgeAi/js/app.js',
  '/NexusAppForgeAi/js/ui-manager.js',
  '/NexusAppForgeAi/js/code-editor.js',
  '/NexusAppForgeAi/js/template-manager.js',
  '/NexusAppForgeAi/js/ai-engine.js',
  '/NexusAppForgeAi/js/apk-builder.js',
  '/NexusAppForgeAi/js/user-manager.js',
  '/NexusAppForgeAi/js/preview-manager.js',
  '/NexusAppForgeAi/manifest.json',
  '/NexusAppForgeAi/favicon.ico',
  '/NexusAppForgeAi/icon-192.png',
  '/NexusAppForgeAi/icon-512.png',
  '/NexusAppForgeAi/apple-touch-icon.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            if (event.request.url.indexOf('.html') > -1) {
              return caches.match('/NexusAppForgeAi/index.html');
            }
          });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const title = 'AppForge AI';
  const options = {
    body: event.data ? event.data.text() : 'New notification from AppForge',
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/NexusAppForgeAi/')
  );
});
