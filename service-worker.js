/*
 * Trade Journal — Service Worker
 * หน้าที่: แคช "เปลือกแอป" (index.html, manifest, ไอคอน, ฟอนต์/สคริปต์ CDN) ให้เปิดออฟไลน์ได้
 * ไม่แตะต้อง localStorage / IndexedDB ของแอปเลย — ข้อมูลธุรกรรมทั้งหมดยังคงอยู่ในเบราว์เซอร์ตามเดิม
 * ไม่มี API ราคาหุ้นภายนอกให้แคชในแอปนี้ (ราคาเป็นค่าที่ผู้ใช้กรอกเอง จึงไม่มีความเสี่ยงเรื่องราคาเก่าค้างแคช)
 */

// เปลี่ยนเลขเวอร์ชันทุกครั้งที่แก้ไฟล์แอป เพื่อบังคับให้แคชเก่าถูกล้างและโหลดของใหม่
const CACHE_VERSION = 'tj-v1';
const SHELL_CACHE = CACHE_VERSION + '-shell';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_FILES))
      .catch(() => { /* ออฟไลน์ตอนติดตั้งครั้งแรกก็ไม่เป็นไร จะแคชทีหลังตอนใช้งานจริง */ })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isShellRequest(url) {
  return url.origin === self.location.origin;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (isShellRequest(url)) {
    // ไฟล์ของแอปเอง: cache-first, เติมแคชใหม่เงียบๆ เมื่อมีเน็ต
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.ok) caches.open(SHELL_CACHE).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // ทรัพยากรภายนอก (ฟอนต์, สคริปต์อ่าน Excel จาก CDN): stale-while-revalidate
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(cache =>
      cache.match(req).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
