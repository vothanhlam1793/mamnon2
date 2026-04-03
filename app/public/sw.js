self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (event) => {
  // Pass-through for now
  event.respondWith(fetch(event.request));
});
