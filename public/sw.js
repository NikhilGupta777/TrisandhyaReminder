const CACHE_NAME = 'trisandhya-v2';
const AUDIO_CACHE = 'trisandhya-audio-v1';

// Static assets to cache - only cache what exists
const STATIC_ASSETS = [
  '/',
];

// Audio file extensions to cache separately
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Try to cache but don't fail if some assets are missing
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response) : Promise.resolve())
              .catch(() => Promise.resolve())
          )
        );
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation error:', error);
        return self.skipWaiting(); // Skip waiting even if cache fails
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== AUDIO_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Check if request is for audio file
function isAudioRequest(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  return AUDIO_EXTENSIONS.some(ext => pathname.endsWith(`.${ext}`));
}

// Fetch event - serve from cache or network with audio-specific handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle audio files separately for better mobile support
  if (isAudioRequest(url)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving audio from cache:', url);
            return cachedResponse;
          }

          // Fetch and cache audio files
          return fetch(request).then((response) => {
            // Only cache successful responses
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              cache.put(request, responseToCache).then(() => {
                console.log('[SW] Cached audio file:', url);
              });
            }
            return response;
          }).catch((error) => {
            console.error('[SW] Audio fetch failed:', error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Handle static assets - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache (offline):', url);
            return cachedResponse;
          }
          // If no cache match, return a basic response
          return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Message event - handle communication from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Clear audio cache if requested
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    caches.delete(AUDIO_CACHE).then(() => {
      console.log('[SW] Audio cache cleared');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notification = {
    title: 'Trisandhya Sadhana',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'default',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notification = {
        title: data.title || notification.title,
        body: data.message || data.body || notification.body,
        icon: data.icon || data.imageUrl || notification.icon,
        badge: notification.badge,
        tag: data.id || data.tag || notification.tag,
        data: data,
        requireInteraction: data.priority === 'high',
        vibrate: data.priority === 'high' ? [200, 100, 200] : [100],
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.targetUrl || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event handler
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  // Could track notification dismissal here
});

// Background sync for offline audio queueing (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-audio-queue') {
      event.waitUntil(
        // Handle any queued audio synchronization here
        Promise.resolve()
      );
    }
  });
}

console.log('[SW] Service Worker loaded successfully with push notification support');
