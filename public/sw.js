// Minimal PWA service worker for Sector D-12 Incident Intelligence Portal
const CACHE_NAME = 'd12-portal-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first policy to keep Google Sheets data live
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
