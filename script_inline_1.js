
    // PWA légère : pas de cache agressif, juste ce qu'il faut pour rendre l'app installable.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js?v=36').catch(() => {});
      });
    }
    if (window.caches) {
      caches.keys().then(keys => keys.filter(k => !k.includes('v37')).forEach(key => caches.delete(key))).catch(()=>{});
    }
  