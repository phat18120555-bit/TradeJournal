/*
 * Trade Journal — Service Worker
 * หน้าที่: แคช "เปลือกแอป" (index.html, manifest, ไอคอน, ฟอนต์/สคริปต์ CDN) ให้เปิดออฟไลน์ได้
 * ไม่แตะต้อง localStorage / IndexedDB ของแอปเลย — ข้อมูลธุรกรรมทั้งหมดยังคงอยู่ในเบราว์เซอร์ตามเดิม
 * แอปนี้ดึงราคาหุ้น/เรท USD-THB สดจาก API ภายนอก (ดู LIVE_DATA_HOSTS) — Service Worker ตั้งใจไม่แคชโฮสต์เหล่านี้เด็ดขาด
 * เพื่อไม่ให้ราคาที่แสดงเป็นค่าค้างแคชเก่า การ fallback เมื่อ API ล่มเป็นหน้าที่ของโค้ดในแอป (เก็บค่าล่าสุดไว้ใน state เอง)
 */

// เปลี่ยนเลขเวอร์ชันทุกครั้งที่แก้ไฟล์แอป เพื่อบังคับให้แคชเก่าถูกล้างและโหลดของใหม่
const CACHE_VERSION = 'tj-v10';
const SHELL_CACHE = CACHE_VERSION + '-shell';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';

// โฮสต์ของ API ราคาหุ้น/เรทแลกเปลี่ยนแบบ real-time — ห้ามแคชเด็ดขาด ต้องขอข้อมูลสดจากเน็ตทุกครั้ง
// ถ้าออฟไลน์/ล้มเหลว ให้ fetch() พังตามจริง แล้วให้โค้ดในแอปเป็นคนจัดการ fallback ไปใช้ค่าล่าสุดที่เก็บไว้เอง (ไม่ใช่หน้าที่ Service Worker)
const LIVE_DATA_HOSTS = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com', 'api.frankfurter.dev', 'api.frankfurter.app', 'corsproxy.io', 'api.allorigins.win'];

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

  if (LIVE_DATA_HOSTS.includes(url.hostname)) {
    // ราคาหุ้น/เรทแลกเปลี่ยนต้องสดเสมอ — network-only ไม่แตะแคช
    event.respondWith(fetch(req));
    return;
  }

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
