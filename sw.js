// سروس ورکر کا ورژن بدل دیں تاکہ یہ دوبارہ انسٹال ہو
const CACHE_NAME = 'dua-app-cache-v5-final';
// اپنی ریپازٹری کا نام یہاں لکھیں
const REPO_PREFIX = '/dua/';

// وہ تمام فائلیں جنہیں کیشے کرنا ہے، مکمل راستے کے ساتھ
const urlsToCache = [
  REPO_PREFIX, // ریپازٹری کی جڑ (root)
  REPO_PREFIX + 'index.html', // index.html فائل
  REPO_PREFIX + 'manifest.json',
  REPO_PREFIX + 'icon-192.png',
  REPO_PREFIX + 'icon-512.png'
];

// سروس ورکر انسٹال کریں
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching all assets with full paths');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// پرانے کیشے کو صاف کریں
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
  return self.clients.claim();
});

// ہر درخواست کا جواب دیں
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر کیشے میں جواب موجود ہے تو وہ واپس کریں
        if (response) {
          return response;
        }
        // ورنہ نیٹ ورک سے درخواست کریں
        return fetch(event.request);
      })
  );
});
