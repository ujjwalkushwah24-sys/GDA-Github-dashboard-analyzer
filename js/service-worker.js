// service-worker.js — cache-first for static assets, network-first for API

const CACHE_NAME = 'ghd-v1';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/themes.css',
  '/css/components.css',
  '/js/theme.js',
  '/js/main.js',
  '/js/api.js',
  '/js/cache.js',
  '/js/dataTransformer.js',
  '/js/stats.js',
  '/js/chartHelpers.js',
  '/js/domRenderer.js',
  '/js/scoreEngine.js',
  '/js/comparator.js',
  '/js/radarChart.js',
  '/js/ruleEngine.js',
  '/js/aiSuggestions.js',
  '/js/suggestionRenderer.js',
  '/js/loadingState.js',
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static, network-first for API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-first for GitHub API — always want fresh data
  if (url.hostname === 'api.github.com') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});