/* Filolini Web – Service Worker. Zwischenspeicher mit Versionsname: bei jeder neuen Version ändert sich 8.0.0-beta.10.5.2-307254bd96b2 (tools/web-target.js),
   der Browser erkennt die geänderte Datei, lädt die neue Version im Hintergrund und meldet sie der Seite (Hinweis „Neue Version verfügbar“).
   Aktiv wird sie erst nach Tipp auf „Jetzt aktualisieren“ (Nachricht SKIP_WAITING). Daten (IndexedDB) fasst der Service Worker nie an. */
'use strict';
var CACHE = 'filolini-8.0.0-beta.10.5.2-307254bd96b2';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'hilfe.html', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon-180.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(CORE.map(function (u) { return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (!r.ok) throw new Error(u); return c.put(u, r); }); })); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return /^filolini-/.test(k) && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url); if (url.origin !== self.location.origin) return;
  if (/\/version\.json$/.test(url.pathname)) return; /* Versionsdatei immer frisch aus dem Netz */
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (r) { if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } return r; }).catch(function () {
      if (req.mode === 'navigate') return caches.match('index.html');
      return new Response('', { status: 504, statusText: 'offline' });
    });
  }));
});
self.addEventListener('notificationclick', function (e) { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (l) { if (l.length) return l[0].focus(); return self.clients.openWindow('./'); })); });
