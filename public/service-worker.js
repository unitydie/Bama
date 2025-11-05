const CACHE_NAME = "bama-smoothie-cache-v2"; // 🆕 смена версии, чтобы сбросить старый кеш
const FILES_TO_CACHE = [
  "/",                 // html попадёт в network-first ниже, но пусть будет для первого захода
  "/index.html",
  "/styles.css",
  // ВАЖНО: не кладём сюда /script.js, чтобы не прибивать обновления
  "/Images/AnanasMango.png",
  "/Images/BlabaerEple.png",
  "/Images/BringebaerJordbaer.png",
  "/Images/KiwiEple.png"
];

// Установка Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
  console.log("✅ SW installed and files cached");
});

// Активация — чистим старые кеши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  console.log("♻️ SW activated");
});

// Стратегии запросов
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1) Никогда не кэшируем API — только сеть
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2) Для скриптов и документов — network-first (чтобы обновления прилетали сразу)
  if (event.request.destination === "script" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request)) // оффлайн — из кеша, если есть
    );
    return;
  }

  // 3) Остальное — cache-first (картинки, стили и т.п.)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      });
    })
  );
});
