// A more robust service worker

const CACHE_NAME = 'kailash-app-cache-v2'; // Note: I changed the version number

// This list should contain the absolute core files needed for the app shell to load
const URLS_TO_CACHE = [
  '/kailash-app/',
  '/kailash-app/index.html',
  '/kailash-app/style.css',
  '/kailash-app/manifest.json',
  '/kailash-app/icons/icon-192x192.png',
  '/kailash-app/icons/icon-512x512.png'
];

// 1. Installation: Caches the core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// 2. Fetch: Tries network first, then falls back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Try to get the resource from the network
    fetch(event.request).catch(() => {
      // If the network request fails (e.g., user is offline),
      // try to get it from the cache.
      return caches.match(event.request);
    })
  );
});

// 3. Activation: Cleans up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
