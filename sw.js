// یہ ہمارا آخری اور بہترین ورژن ہے
const CACHE_NAME = 'dua-app-cache-v11-navigation-fix'; 
const REPO_PREFIX = '/dua/';
const APP_SHELL_URL = REPO_PREFIX + 'index.html';

// وہ تمام فائلیں جنہیں کیشے کرنا ہے
const urlsToCache = [
  APP_SHELL_URL,
  REPO_PREFIX + 'manifest.json',
  REPO_PREFIX + 'icon-192.png',
  REPO_PREFIX + 'icon-512.png'
];

// 1. انسٹال: نیا سروس ورکر انسٹال کریں
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. ایکٹیویٹ: پرانے کیشے کو صاف کریں
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. فیچ: سب سے اہم اور نیا حصہ
self.addEventListener('fetch', event => {
  // اگر یہ ایک صفحے کی درخواست (navigation request) ہے
  if (event.request.mode === 'navigate') {
    event.respondWith(
      // کیشے میں سے index.html کو تلاش کریں
      caches.match(APP_SHELL_URL)
        .then(response => {
          // اگر وہ مل جائے تو اسے واپس کریں، ورنہ نیٹ ورک سے لانے کی کوشش کریں
          return response || fetch(APP_SHELL_URL);
        })
    );
    return; // یہاں رک جائیں
  }

  // دیگر تمام درخواستوں (تصاویر، manifest) کے لیے، کیشے کو پہلے دیکھیں
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
