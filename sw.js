const CACHE_NAME = "mundo-ofertas-v4";
const ASSETS = [
  "/index.html",
  "/manifest.json"
];

// Instalar e cachear assets principais
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Limpar caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first, fallback para cache
self.addEventListener("fetch", event => {
  // Não interceptar chamadas do Supabase (sempre online)
  if (event.request.url.includes("supabase.co") ||
      event.request.url.includes("viacep.com.br") ||
      event.request.url.includes("picsum.photos")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
