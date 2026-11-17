// Service worker: keeps a copy of pages and game code so the arcade opens
// and plays without a connection.

const CACHE = "timepass-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

async function save(request, response) {
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

// Fresh copy when online, saved copy when not.
async function networkFirst(request, fallbackUrl) {
  try {
    return await save(request, await fetch(request));
  } catch (error) {
    const cached =
      (await caches.match(request, { ignoreVary: true })) ||
      (fallbackUrl && (await caches.match(fallbackUrl, { ignoreVary: true })));
    if (cached) return cached;
    throw error;
  }
}

// Files whose names change whenever their content does never go stale.
async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreVary: true });
  return cached || save(request, await fetch(request));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/"));
  } else {
    event.respondWith(networkFirst(request));
  }
});
