// A more robust service worker
const CACHE_NAME = 'kailash-app-cache-v4'; // Increased version to force update

const URLS_TO_CACHE = [
  '/kailash-app/',
  '/kailash-app/index.html',
  '/kailash-app/style.css',
  '/kailash-app/script.js',
  '/kailash-app/manifest.json',
  '/kailash-app/icons/icon-192x192.png',
  '/kailash-app/icons/icon-512x512.png'
];

// 1. Installation: Caches the core app shell
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new service worker to activate
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// 2. Fetch: Tries network first, then falls back to cache for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
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

// 4. Background Sync: Handles offline orders
self.addEventListener('sync', (event) => {
    if (event.tag === 'send-order') {
        event.waitUntil(sendOfflineOrder());
    }
});

async function sendOfflineOrder() {
    // Import the idb-keyval library so we can use it inside the service worker
    self.importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

    const orderData = await idbKeyval.get('offline-order');
    if (!orderData) return;

    const whatsappNumber = '917598242759';
    let message = `*OFFLINE ORDER from KAILASH*\n\n*Customer:* ${orderData.name}\n*Phone:* ${orderData.phone}\n\n*Items:*\n----------------------\n`;
    
    Object.entries(orderData.cart).forEach(([key, item]) => {
        const p = orderData.products.find(p => p.id === item.productId);
        if (p) {
            message += `• ${p.name}${item.size ? `(${item.size})` : ''} x ${item.quantity} = ₹${(p.price * item.quantity).toFixed(2)}\n`;
            message += `  📸 Image: ${p.image}\n`;
        }
    });

    message += `----------------------\n*Total Amount:* ₹${orderData.total}\n\n*Shipping Address:*\n${orderData.address}`;
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    await idbKeyval.del('offline-order');
    
    // Show a notification to the user to complete the action
    return self.registration.showNotification('KAILASH Order Ready', {
        body: 'Your offline order is ready to be sent. Tap here to open WhatsApp!',
        icon: '/kailash-app/icons/icon-192x192.png',
        data: { url: url } // Store the URL in the notification data
    });
}

// Handle notification click to open the WhatsApp link
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
