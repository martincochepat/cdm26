const CACHE_NAME='guide-mondial-2026-v28';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('message',event=>{
  if(event.data==='skipWaiting') self.skipWaiting();
});
// Pas de stratégie cache agressive : Vercel sert toujours la version à jour.
self.addEventListener('fetch',()=>{});
