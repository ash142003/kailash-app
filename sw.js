// Define a name for the cache
const CACHE_NAME = 'kailash-app-cache-v1';

// List all the essential files with the CORRECT paths
const URLS_TO_CACHE = [
  '/kailash-app/',
  '/kailash-app/index.html',
  '/kailash-app/download.html',
  '/kailash-app/add-product.html',
  '/kailash-app/style.css',
  '/kailash-app/script.js',
  '/kailash-app/manifest.json',
  '/kailash-app/icons/icon-512x512.png',
  '/kailash-app/icons/icon-192x192.png'
  // Add more image paths here if you want them to work offline
];

// When the service worker is installed, open the cache and add the files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// When the browser requests a file, check the cache first
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the file is in the cache, return it. Otherwise, fetch it from the network.
        return response || fetch(event.request);
      })
  );
});
