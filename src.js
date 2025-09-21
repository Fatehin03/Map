const CACHE_NAME = 'worldmap-v1'
const ASSETS = ['/', '/index.html', '/src/main.jsx']
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)))
})
self.addEventListener('fetch', e=>{
  // simple cache-first for app shell, network-first for APIs
  if(e.request.url.includes('/markers') || e.request.url.includes('/nominatim')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))
    return
  }
  e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)))
})
