const CACHE_NAME = 'registro-anestesico-v4';
const STATIC_CACHE = 'registro-anestesico-static-v4';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/Logo_1774145758656.png',
  '/apple-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Skip waiting cuando la página lo solicita (botón "Actualizar") ───────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Install: precache core assets ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: caching strategies ────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore cross-origin, HMR and internal Next.js paths
  if (
    url.hostname !== self.location.hostname ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/_vercel/')
  ) {
    return;
  }

  // ── Next.js content-hashed static files → cache-first (nombres con hash = seguros)
  if (
    url.pathname.startsWith('/_next/static/chunks/') ||
    url.pathname.startsWith('/_next/static/css/') ||
    url.pathname.startsWith('/_next/static/media/')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response && response.status === 200) {
          cache.put(event.request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // ── Otros /_next/ → network-first con fallback a caché
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ── Navegación → network-first, fallback al shell cacheado
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((r) => r || caches.match('/'))
        )
    );
    return;
  }

  // ── Assets públicos (logo, iconos, etc.) → cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      });
    })
  );
});
