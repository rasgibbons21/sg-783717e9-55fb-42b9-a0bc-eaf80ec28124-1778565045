// Kill-switch: unregisters this worker, wipes all caches, reloads open clients.
// Replaced the old cache-first shell worker which caused stale code to persist
// after deployments. Web push is not live; no caching SW is needed.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        self.registration.unregister();
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});
