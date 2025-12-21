// Adinath Hospital Service Worker
// Version 2.0 - Force cache bust
const CACHE_NAME = 'adinath-hospital-v2.0';

// Minimal caching for production - only static assets
const urlsToCache = [
    '/',
    '/images/favicon.svg'
];

// Install event - minimal cache
self.addEventListener('install', event => {
    console.log('[SW] Installing v2.0');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching minimal assets');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log('[SW] Cache failed:', err);
            })
    );
    // Force activate immediately
    self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating v2.0 - clearing old caches');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete ALL caches except current
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control immediately
    self.clients.claim();
});

// Fetch event - Network-first strategy for HTML/JS
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Always go to network for HTML and JS files
    if (event.request.destination === 'document' || 
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.js')) {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(() => {
                    // Only use cache as fallback for offline
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Cache-first for images and static assets
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    // Only cache successful responses for images
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    // Cache images only
                    if (event.request.destination === 'image') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('/404.html');
                }
            })
    );
});

// Listen for skip waiting message
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
