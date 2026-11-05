// Офлайн-режим: після першого відкриття з інтернетом гра й інструкція працюють без мережі.
// Сторінки — спершу з мережі (щоб з інтернетом завжди була свіжа версія), без мережі — з кешу.
// Шрифти й значки змінюються рідко, тому спершу з кешу.
const CACHE = 'hot-keys-v1';
const FILES = [
  './', './index.html', './guide/', './guide/index.html', './manifest.webmanifest',
  './fonts/fonts.css', './fonts/baloo2-latin.woff2', './fonts/nunitosans-cyrillic.woff2', './fonts/nunitosans-latin.woff2',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});

// Видаляємо лише старі версії цієї гри: усі ігри сайту cyrilreyda.github.io ділять одне сховище кешів.
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k.startsWith('hot-keys-') && k !== CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const stable = /\/(fonts|icons)\//.test(new URL(req.url).pathname);
  if(stable){
    e.respondWith(caches.match(req).then(hit=>hit || fetch(req).then(res=>{ put(req, res.clone()); return res; })));
    return;
  }
  e.respondWith(fetch(req)
    .then(res=>{ if(res.ok) put(req, res.clone()); return res; })
    .catch(()=>caches.match(req, { ignoreSearch:true }).then(hit=>hit || caches.match('./index.html'))));
});

function put(req, res){ caches.open(CACHE).then(c=>c.put(req, res)); }
