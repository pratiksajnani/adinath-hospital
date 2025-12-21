// Adinath Hospital Service Worker
const CACHE_NAME = 'adinath-hospital-v1';
const urlsToCache = [
    '/adinath-hospital/',
    '/adinath-hospital/index.html',
    '/adinath-hospital/book.html',
    '/adinath-hospital/404.html',
    '/adinath-hospital/css/styles.css',
    '/adinath-hospital/js/main.js',
    '/adinath-hospital/js/config.js',
    '/adinath-hospital/js/i18n.js',
    '/adinath-hospital/images/favicon.svg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log('Cache failed:', err);
            })
    );
    self.skipWaiting();
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
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // If both cache and network fail, show offline page
                if (event.request.mode === 'navigate') {
                    return caches.match('/adinath-hospital/404.html');
                }
            })
    );
});

