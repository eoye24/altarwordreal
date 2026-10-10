const CACHE='altarword-remote-v11-status-cleanup';
const CORE=[
  './',
  './index.html',
  './AltarWordRemote.html',
  './AltarWord.html',
  './remote.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './vendor/fonts.css'
];

self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache = await caches.open(CACHE);
    await Promise.allSettled(CORE.map(url => cache.add(new Request(url,{cache:'reload'}))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request,{cache:'no-store'});
      if(response && response.ok){
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(e){
      const cached=await caches.match(event.request);
      if(cached) return cached;
      if(event.request.mode==='navigate'){
        return (await caches.match('./AltarWordRemote.html')) || (await caches.match('./index.html'));
      }
      throw e;
    }
  })());
});
