const CACHE='raz-logico-v8';
const CORE=['./','./index.html','./manifest.webmanifest','./firebase-config.js','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Inicio de sesión y base de datos: siempre directo a la red, nunca desde caché
  if(/googleapis\.com|firebaseapp\.com|identitytoolkit|securetoken/.test(url.host))return;
  const same=url.origin===location.origin;
  if(same){ // archivos de la app: primero la red (versión nueva), si no hay internet, la copia guardada
    e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;}).catch(()=>caches.match(req).then(h=>h||caches.match('./index.html'))));
    return;
  }
  // fuentes y librerías externas: primero la caché
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})));
});
