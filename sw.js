// A name for our cache - version updated to v3 to include background sync!
const CACHE_NAME = 'kailash-store-v3';

// The library needed for background sync to access the offline database.
const IDB_KEYVAL_URL = 'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js';

// A complete list of all the essential files your app needs to work offline.
// Using full paths is more reliable for GitHub Pages.
const APP_SHELL_URLS = [
  '/kailash-app/',
  '/kailash-app/index.html',
  '/kailash-app/add-product.html',
  '/kailash-app/download.html',
  '/kailash-app/style.css',
  '/kailash-app/script.js',
  '/kailash-app/manifest.json',
  '/kailash-app/images/LOGO.png',
  IDB_KEYVAL_URL // Important: Cache the helper library!
];

// --- STANDARD CACHING LOGIC ---

// The 'install' event: Caches the entire app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[Service Worker] Caching App Shell for version: ${CACHE_NAME}`);
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

// The 'activate' event: Cleans up old, unused caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// The 'fetch' event: Serves content from cache first (Cache First strategy).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we found a match in the cache, return it.
        // Otherwise, fetch it from the network.
        return response || fetch(event.request);
      })
  );
});


// --- BACKGROUND SYNC LOGIC ---

// The 'sync' event: Listens for the 'send-order' tag.
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-order') {
    console.log('[Service Worker] Received background sync request for "send-order"');
    event.waitUntil(sendOrderFromBackground());
  }
});

// Helper function to process the sync task.
async function sendOrderFromBackground() {
  try {
    // Import the helper library inside the worker.
    importScripts(IDB_KEYVAL_URL);

    // Get the saved order from the offline database.
    const orderData = await idbKeyval.get('offline-order');
    if (!orderData) {
      console.log('[Service Worker] No offline order data found.');
      return;
    }

    console.log('[Service Worker] Found offline order. Preparing to send.', orderData);
    const { name, phone, address, cart, total, products } = orderData;
    
    // Construct the WhatsApp message.
    const whatsappNumber = '917598242759';
    let message = `*NEW ORDER from KAILASH (Sent from Offline)*\n\n*Customer:* ${name}\n*Phone:* ${phone}\n\n*Items:*\n----------------------\n`;
    
    Object.entries(cart).forEach(([key, item]) => {
        const p = products.find(p => p.id === item.productId);
        if (p) {
            message += `• ${p.name}${item.size ? `(${item.size})` : ''} x ${item.quantity} = ₹${(p.price * item.quantity).toFixed(2)}\n`;
            message += `  📸 Image: ${p.image}\n`;
        }
    });

    message += `----------------------\n*Total Amount:* ₹${total}\n\n*Shipping Address:*\n${address}`;

    // IMPORTANT: The service worker cannot directly open a window.
    // It must fetch a resource, which the browser handles.
    // This is a more reliable way to trigger the WhatsApp link from the background.
    await fetch(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, { mode: 'no-cors' });
    
    // An alternative method that is good for showing the user a notification.
    // self.registration.showNotification("Order Sent!", {
    //   body: "Your KAILASH order has been successfully sent.",
    //   icon: "/kailash-app/icons/icon-192x192.png"
    // });

    // Clean up the database after sending.
    console.log('[Service Worker] Order sent successfully. Deleting from offline storage.');
    await idbKeyval.del('offline-order');

  } catch (err) {
    console.error('[Service Worker] Error during background sync:', err);
    // Re-throw the error to let the browser know the sync attempt failed,
    // so it can try again later.
    throw err;
  }
}
