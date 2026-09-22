const CACHE_NAME = "trade-journal-v1";

const APP_FILES = [
  "./",
"./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ติดตั้ง Service Worker และเก็บไฟล์หลัก
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// เปิดใช้งาน Service Worker ใหม่
self.addEventListener("activate", event => {
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

// ถ้าเปิดหน้าเว็บ ให้ลองใช้ Network ก่อน
// ถ้าไม่มีเน็ต ค่อยใช้ไฟล์ที่ Cache ไว้
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cached => cached || caches.match("./trade-journal.html"));
      })
  );
});