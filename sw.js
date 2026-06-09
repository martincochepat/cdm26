const CACHE_NAME='guide-mondial-2026-v27';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());});
// Pas de stratégie cache agressive : Vercel sert toujours la version à jour.
self.addEventListener('fetch',()=>{});
