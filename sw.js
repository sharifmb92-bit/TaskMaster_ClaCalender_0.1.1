const CACHE_NAME = 'taskmaster-v1.5.1';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});

// Permite disparar notificaciones (con vibración) desde el hilo principal
// pasando por el Service Worker, lo cual es más fiable en Android.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_ALARM') {
        self.registration.showNotification(event.data.title || 'TaskMaster', {
            body: event.data.body || '',
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200, 100, 400],
            tag: event.data.tag || 'taskmaster-alarm',
            requireInteraction: true
        });
    }
});
