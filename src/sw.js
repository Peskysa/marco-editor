const CACHE='marco-editor-1.0.0';
const SHELL=['./','index.html','styles.css','app.js','assets/icon.svg','assets/icon-192.png','assets/icon-512.png','manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marco-editor-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  if(!/\.(?:js|css|png|svg|json|bin|webmanifest)$/.test(url.pathname)&&!event.request.mode.includes('navigate'))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}
    catch{const saved=await cache.match(event.request);if(saved)return saved;throw new Error('Recurso sin conexión no disponible');}
  }));
});
