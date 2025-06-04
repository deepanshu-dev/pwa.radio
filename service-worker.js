const cacheName = "fm-radio-cache";
const assets = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "assets/radioStations.json",
  "assets/favicon.ico",
  "assets/icons/icon-192x192.png",
  "assets/icons/icon-512x512.png",
  "assets/svg/volume-mute.svg",
  "assets/svg/volume-unmute.svg",
];

// Helper function to determine if a request should be cached
function isCacheable(request) {
  const url = new URL(request.url);
  return !url.pathname.endsWith(".json");
}

// Cache-First Strategy with Refresh from Network
async function cacheFirstWithRefresh(request) {
  const cache = await caches.open(cacheName);

  // Try to return cached response
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Update the cache in the background
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch((error) =>
        console.error("Fetch failed; returning cached resource.", error)
      );
    return cachedResponse;
  }

  // Fallback to network if not cached
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error("Network request failed:", error);
      return new Response("Network error occurred.", { status: 404 });
    });
}

// Install event - cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});

// Activate event - clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== cacheName) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  console.log("Service Worker activated.");
});

// Fetch event - use cache-first strategy with refresh
self.addEventListener("fetch", (event) => {
  if (isCacheable(event.request)) {
    event.respondWith(cacheFirstWithRefresh(event.request));
  }
});