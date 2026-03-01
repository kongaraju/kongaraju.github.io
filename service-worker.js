/**
 * Service Worker for Raju Konga Portfolio
 * Provides offline functionality and performance optimization
 * Version: 1.0.0
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `raju-konga-portfolio-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/pages/resume.html',
    '/pages/case-studies/arkeydock.html',
    '/pages/case-studies/arkeyjs.html',
    '/pages/case-studies/antkorp.html',
    '/pages/privacy-policy.html',
    '/404.html',
    '/components/cookie-consent.html',
    '/assets/css/cookie-consent.css',
    '/assets/js/cookie-consent.js',
    '/assets/js/performance.js',
    '/assets/js/pwa-install.js',
    '/manifest.json',
    '/favicon.ico'
];

// Runtime cache configuration
const RUNTIME_CACHE_NAME = `${CACHE_NAME}-runtime`;
const IMAGE_CACHE_NAME = `${CACHE_NAME}-images`;
const FONT_CACHE_NAME = `${CACHE_NAME}-fonts`;

// Cache duration (in seconds)
const CACHE_DURATION = {
    images: 30 * 24 * 60 * 60, // 30 days
    fonts: 365 * 24 * 60 * 60, // 1 year
    pages: 7 * 24 * 60 * 60     // 7 days
};

/**
 * Install Event - Cache essential assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old versions
                            return cacheName.startsWith('raju-konga-portfolio-') && 
                                   cacheName !== CACHE_NAME &&
                                   cacheName !== RUNTIME_CACHE_NAME &&
                                   cacheName !== IMAGE_CACHE_NAME &&
                                   cacheName !== FONT_CACHE_NAME;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch Event - Serve from cache with network fallback
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip analytics and external APIs
    if (url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('googletagmanager.com') ||
        url.hostname.includes('analytics.google.com')) {
        return;
    }

    // Handle different resource types
    if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
    } else if (request.destination === 'font' || url.pathname.includes('/fonts/')) {
        event.respondWith(handleFontRequest(request));
    } else if (request.destination === 'document' || 
               request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(handlePageRequest(request));
    } else {
        event.respondWith(handleAssetRequest(request));
    }
});

/**
 * Handle page requests - Network first, cache fallback
 */
async function handlePageRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page if available
        const offlinePage = await caches.match('/404.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        // Last resort: generic offline response
        return new Response(
            '<html><body><h1>Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
            {
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

/**
 * Handle image requests - Cache first, network fallback
 */
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Check if cache is still fresh
        const cacheDate = new Date(cachedResponse.headers.get('date'));
        const now = new Date();
        const age = (now - cacheDate) / 1000;
        
        if (age < CACHE_DURATION.images) {
            return cachedResponse;
        }
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return cached version even if stale
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return placeholder image
        return new Response(
            '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">Image unavailable</text></svg>',
            {
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
}

/**
 * Handle font requests - Cache first, network fallback
 */
async function handleFontRequest(request) {
    const cache = await caches.open(FONT_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Font fetch failed:', error);
        throw error;
    }
}

/**
 * Handle asset requests (CSS, JS) - Cache first, network fallback
 */
async function handleAssetRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Fetch in background to update cache
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse.ok) {
                    cache.put(request, networkResponse);
                }
            })
            .catch(() => {
                // Ignore network errors for background updates
            });
        
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Asset fetch failed:', error);
        throw error;
    }
}

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_VERSION
        });
    }
});

/**
 * Background Sync - Handle offline form submissions
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-contact-form') {
        event.waitUntil(syncContactForm());
    }
});

/**
 * Sync contact form submissions
 */
async function syncContactForm() {
    // This would sync any queued form submissions
    // Implementation depends on your backend
    console.log('[Service Worker] Syncing contact form submissions');
}

/**
 * Push Notification - Handle push events
 */
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/assets/img/icons/android-chrome-192x192.png',
        badge: '/assets/img/icons/favicon-32x32.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: '/assets/img/icons/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/img/icons/favicon-32x32.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Raju Konga Portfolio', options)
    );
});

/**
 * Notification Click - Handle notification interactions
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[Service Worker] Loaded successfully');
