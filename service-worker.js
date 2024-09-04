const cacheName = "fm-radio-cache";
const assets = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "assets/favicon.ico",
  "assets/icons/icon-192x192.png",
  "assets/icons/icon-512x512.png",
  "assets/svg/volume-mute.svg",
  "assets/svg/volume-unmute.svg",
];

function isCacheable(request) {
  const url = new URL(request.url);
  return !url.pathname.endsWith(".json");
}

async function cacheFirstWithRefresh(request) {
    const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open("MyCache_1");
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
  
    return (await caches.match(request)) || (await fetchResponsePromise);
  }

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
});

self.addEventListener("fetch", (event) => {
  if (isCacheable(event.request)) {
    event.respondWith(cacheFirstWithRefresh(event.request));
  }
});
