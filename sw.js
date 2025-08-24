// Service Worker ka naya, saaf suthra aur universal version
const CACHE_NAME = 'hifaz-tracker-cache-v1'; // Aap apni app ka naam de sakte hain

// Woh tamam files jinhein cache karna hai (bina kisi prefix ke)
// Yeh zaroori hai ke in files ke naam bilkul wese hi hon jaise aapke folder mein hain
const urlsToCache = [
  './',             // Yeh root ko represent karta hai, aam tor par index.html
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Agar aapne libraries download karke libs folder mein rakhi hain, to unhein bhi shamil karein
  // './libs/jspdf.umd.min.js',
  // './libs/html2canvas.min.js',
  // Agar aap online libraries istemal kar rahe hain, to unke poore URL shamil karein
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// 1. Install: App shell ko cache karein
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching app shell files.');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. Activate: Purane cache ko saaf karein
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch: Cache se jawab dein, agar na mile to network par jayein
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Agar cache mein hai, to wohi wapas karein
        if (response) {
          return response;
        }
        // Agar cache mein nahi hai, to network se laane ki koshish karein
        return fetch(event.request);
      })
  );
});
