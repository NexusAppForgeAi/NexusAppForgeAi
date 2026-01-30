// AppForge Service Worker
const CACHE_NAME = 'appforge-v1.0.0';
const APP_SHELL = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/main.css',
    '/css/apk-builder.css',
    '/css/syntax-highlight.css',
    '/js/utils.js',
    '/js/ui-manager.js',
    '/js/code-editor.js',
    '/js/preview-manager.js',
    '/js/template-manager.js',
    '/js/ai-engine.js',
    '/js/apk-builder.js',
    '/js/license-manager.js',
    '/js/user-manager.js',
    '/js/app.js',
    '/icon-192.png',
    '/icon-512.png',
    '/favicon.ico'
];

// Install event - cache app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(APP_SHELL);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip API requests and external resources
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) {
        // For external resources, use network only
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                
                // Clone the request because it can only be used once
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response because it can only be used once
                        const responseToCache = response.clone();
                        
                        // Cache the new response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        // For other requests, return a simple error response
                        return new Response('Network error occurred', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-projects') {
        event.waitUntil(syncProjects());
    }
});

async function syncProjects() {
    try {
        // Get pending projects from IndexedDB
        const pendingProjects = await getPendingProjects();
        
        // Sync each project
        for (const project of pendingProjects) {
            await syncProject(project);
        }
        
        console.log('Projects synced successfully');
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

async function getPendingProjects() {
    // This would typically use IndexedDB
    return [];
}

async function syncProject(project) {
    // Sync project to server
    // This is a placeholder for actual sync logic
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from AppForge',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('AppForge', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(windowClients => {
                    // Focus existing window if available
                    for (const client of windowClients) {
                        if (client.url.includes('/') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // Open new window if none exists
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic sync for background updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-cache') {
        event.waitUntil(updateCache());
    }
});

async function updateCache() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const requests = APP_SHELL.map(url => new Request(url));
        
        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.put(request, response);
                }
            } catch (error) {
                console.log(`Failed to update ${request.url}:`, error);
            }
        }
        
        console.log('Cache updated successfully');
    } catch (error) {
        console.error('Cache update failed:', error);
    }
}

// Helper function to clean up old data
async function cleanupOldData() {
    try {
        // Clean up IndexedDB if needed
        // This is a placeholder for actual cleanup logic
        console.log('Performing periodic cleanup');
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
}

// Run cleanup once a day
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);
