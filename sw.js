const CACHE_NAME = 'dua-app-cache-v2'; // کیشے کا ورژن بدل دیں تاکہ نیا سروس ورکر انسٹال ہو
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
  // اگر آپ کی CSS یا JS فائلیں الگ ہیں تو انہیں بھی یہاں شامل کریں
];

// 1. انسٹال: نیا سروس ورکر انسٹال کریں اور اثاثے کیشے کریں
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // فوراً نئے سروس ورکر کو ایکٹیویٹ کرو
});

// 2. ایکٹیویٹ: پرانے کیشے کو صاف کریں
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // تمام کھلے کلائنٹس کا کنٹرول سنبھالو
});

// 3. فیچ: Stale-While-Revalidate حکمت عملی استعمال کریں
self.addEventListener('fetch', event => {
  // صرف GET درخواستوں کا جواب دیں
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // کیشے سے جواب دیں اور پس منظر میں نیٹ ورک سے اپ ڈیٹ کریں
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // اگر درخواست کامیاب ہو تو کیشے کو اپ ڈیٹ کریں
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // نیٹ ورک فیل ہونے پر خاموش رہیں، کیونکہ کیشے سے پہلے ہی جواب جا چکا ہے
            console.warn('Fetch failed; user is likely offline.', err);
        });

        // کیشے سے جواب فوراً واپس کریں اگر موجود ہے، ورنہ نیٹ ورک کے جواب کا انتظار کریں
        return response || fetchPromise;
      });
    })
  );
});
