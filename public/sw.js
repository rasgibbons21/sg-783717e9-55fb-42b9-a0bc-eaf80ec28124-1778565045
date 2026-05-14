const CACHE_NAME = 'bloom-v1';
const urlsToCache = [
  '/',
  '/home',
  '/discover',
  '/goals',
  '/portfolio',
  '/brokers',
  '/profile',
  '/bloom-logo.png',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match('/offline');
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Bloom Price Alert 🌸';
  const options = {
    body: data.body || 'Your stock has moved!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/portfolio',
      ticker: data.ticker,
    },
    actions: [
      {
        action: 'view',
        title: 'View Stock',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
    tag: data.ticker || 'price-alert',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url || '/portfolio';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action: open the app
    event.waitUntil(
      clients.openWindow('/portfolio')
    );
  }
});