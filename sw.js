// Offline support. Bump VERSION whenever a cached file changes.
const VERSION = 'rmaxxing-v26';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'privacy.html', 'support.html',
  'src/app.js', 'src/core.js', 'src/content.js', 'src/brain.js', 'src/cards.js', 'src/intro.js', 'src/sfx.js', 'src/native.js', 'src/store.js', 'src/styles.css',
  'assets/fonts/anton.woff2', 'assets/fonts/bricolage.woff2', 'assets/fonts/dm-mono-500.woff2',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png', 'assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)),
  );
});
