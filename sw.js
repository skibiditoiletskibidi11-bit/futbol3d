const VERSION = "3.26";
const CACHE = "futbol3d-" + VERSION;
const CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", CDN]).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Red primero: si hay internet se usa siempre la versión más nueva; sin internet, la guardada
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});

// Avisos push: llegan aunque el juego esté cerrado
self.addEventListener("push", e => {
  let data = { title: "⚽ Fútbol 3D", body: "Tu equipo te espera." };
  try { if (e.data) data = e.data.json(); } catch (_) { try { data.body = e.data.text(); } catch (_) {} }
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: "icon-192.png", badge: "badge-96.png", tag: "fb3d-rec" }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow("./")));
});
