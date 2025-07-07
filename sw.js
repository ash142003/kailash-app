// A name for our cache - version updated to v2! This is important for updates.
const CACHE_NAME = 'kailash-store-v2';

// A list of all the essential files your app needs to work offline.
// All starting slashes have been removed to make paths relative.
const APP_SHELL_URLS = [
  './',                  // <-- UPDATED
  'index.html',          // <-- UPDATED
  'add-product.html',    // <-- UPDATED
  'style.css',           // <-- UPDATED
  'script.js',           // <-- UPDATED
  'manifest.json',       // <-- UPDATED
  'images/LOGO.png',    // <-- UPDATED
  'images/LOGO.png'    // <-- UPDATED
];

// The 'install' event.
// This is where we download and cache all the files in our APP_SHELL_URLS list.
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
// This event happens every time the app requests a resource (like a CSS file or an image).
// We check if we have it in our cache first. If we do, we serve it from the cache.
// If not, we fetch it from the network.
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
// This is where we clean up old, unused caches (like v1).
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