const CACHE_NAME = "bama-smoothie-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/data.json",
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
  console.log("✅ Service Worker installert og filer cachet");
});

// Активация
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  console.log("♻️ Service Worker aktivert");
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
