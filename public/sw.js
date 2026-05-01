// Minimal service worker - no-op
// This file prevents 500 errors when the browser requests /sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
