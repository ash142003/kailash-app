// A name for our cache - version updated to v2! This is important for updates.
const CACHE_NAME = 'kailash-store-v2';

// A list of all the essential files your app needs to work offline.
const APP_SHELL_URLS = [
  './',
  'index.html',
  'add-product.html',
  'style.css',
  'script.js',
  'manifest.json',
  'images/LOGO.png'
];

// The 'install' event.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell v2');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

// The 'fetch' event.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we found a match in the cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network.
        return fetch(event.request);
      })
  );
});

// The 'activate' event.
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