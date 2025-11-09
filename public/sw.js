/**
 * Service Worker for Bayan Cosmetic
 * Aggressive caching strategy for high traffic performance
 */

const CACHE_VERSION = 'bayan-cosmetic-v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/boutique',
  '/a-propos',
  '/contact',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => 
            name !== STATIC_CACHE && 
            name !== API_CACHE && 
            name !== IMAGE_CACHE
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network first, then cache
  if (url.pathname.includes('/rest/v1/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              cache.put(request, responseClone);
            }
            return response;
          })
          .catch(() => {
            // If network fails, try cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline response if no cache
              return new Response(
                JSON.stringify({ error: 'Offline', cached: true }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
          });
      })
    );
    return;
  }

  // Images - Cache first, then network
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone();
              cache.put(request, responseClone);
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Fonts - Cache first
  if (request.destination === 'font' || url.pathname.match(/\.(woff|woff2|ttf|eot)$/i)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          return cachedResponse || fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Static assets (JS, CSS) - Cache first
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.match(/\.(js|css)$/i)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          return cachedResponse || fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // HTML pages - Network first, then cache
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page
            return caches.match('/').then((indexPage) => {
              return indexPage || new Response('Offline', { status: 503 });
            });
          });
        })
    );
    return;
  }

  // Default: Network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (request.destination === 'image' || request.destination === 'font')) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});


