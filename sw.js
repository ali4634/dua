// سروس ورکر کا ورژن بدل دیں تاکہ براؤزر کو پتہ چلے کہ نیا ورژن آیا ہے
const CACHE_NAME = 'dua-app-cache-v8-smart'; 
// اپنی ریپازٹری کا نام یہاں لکھیں (یہ بہت اہم ہے)
const REPO_PREFIX = '/dua/';

const urlsToCache = [
  REPO_PREFIX,
  REPO_PREFIX + 'index.html',
  REPO_PREFIX + 'manifest.json',
  REPO_PREFIX + 'icon-192.png',
  REPO_PREFIX + 'icon-512.png'
];

// 1. انسٹال: نیا سروس ورکر انسٹال کریں اور فوراً کنٹرول سنبھالیں
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets');
        return cache.addAll(urlsToCache);
      })
  );
  // یہ لائن پرانے سروس ورکر کو ہٹا کر نئے کو فوراً ایکٹیویٹ کر دے گی
  self.skipWaiting(); 
});

// 2. ایکٹیویٹ: پرانے کیشے کو صاف کریں
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // اگر کیشے کا نام موجودہ نام سے مختلف ہے تو اسے ڈیلیٹ کر دیں
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // تمام کھلے ہوئے ٹیبز کا کنٹرول سنبھالیں
  return self.clients.claim();
});

// 3. فیچ: "Stale-While-Revalidate" حکمت عملی
self.addEventListener('fetch', event => {
  // صرف GET درخواستوں کا جواب دیں
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        
        // نیٹ ورک سے تازہ ترین ورژن حاصل کرنے کا وعدہ
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // اگر درخواست کامیاب ہو تو کیشے کو نئے جواب سے اپ ڈیٹ کریں
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // اگر کیشے میں جواب موجود ہے تو فوراً وہ واپس کریں، اور پس منظر میں نیا ورژن لانے دیں
        // ورنہ نیٹ ورک کے جواب کا انتظار کریں
        return cachedResponse || fetchPromise;
      });
    })
  );
});
