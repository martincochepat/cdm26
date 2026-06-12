function attachNavigation(){
      document.querySelectorAll('[data-nav]').forEach(btn=>{
        btn.addEventListener('click',e=>{e.preventDefault(); switchTab(btn.dataset.nav); if(btn.dataset.nav==='matches') scrollToNextMatchSoon()});
      });
      document.querySelectorAll('[data-tab]').forEach(btn=>{
        btn.addEventListener('click',e=>{e.preventDefault(); switchTab(btn.dataset.tab)});
      });
      const shareBtn=document.querySelector('.fav-action');
      if(shareBtn){shareBtn.addEventListener('click',e=>{e.preventDefault(); shareApp();});}
      const searchBtn=document.querySelector('.icon-action');
      if(searchBtn){searchBtn.addEventListener('click',e=>{e.preventDefault(); openSearch();});}
      document.getElementById('mobileSearchClose')?.addEventListener('click',()=>closeSearch());
      document.addEventListener('keydown',e=>{if(e.key==='Escape') closeSearch();});
      const menuBtn=document.getElementById('mobileMenuBtn');
      if(menuBtn){menuBtn.addEventListener('click',e=>{e.preventDefault(); toggleMobileMenu()});}
      document.addEventListener('click',e=>{const d=document.getElementById('mobileDrawer'); const b=document.getElementById('mobileMenuBtn'); if(d&&d.classList.contains('open')&&!d.contains(e.target)&&!b?.contains(e.target)) closeMobileMenu();});
      const logo=document.querySelector('.site-logo');
      if(logo){logo.addEventListener('click',e=>{e.preventDefault(); switchTab('home')});}
      document.querySelectorAll('.footer-links button').forEach(btn=>{
        const txt=btn.textContent.toLowerCase();
        btn.addEventListener('click',e=>{e.preventDefault();
          if(txt.includes('calendrier')) switchTab('matches');
          else if(txt.includes('tv')) switchTab('tv');
          else if(txt.includes('stade')) switchTab('stadiums');
          else if(txt.includes('carte')) switchTab('map');
          else if(txt.includes('favori')) applyQuick('Favoris');
        });
      });
    }
    window.switchTab=switchTab; window.toggleMobileMenu=toggleMobileMenu; window.applyQuick=applyQuick; window.openDetail=openDetail; window.openStadiumDetail=openStadiumDetail; window.openSearch=openSearch; window.closeSearch=closeSearch;


    // V28 — installation PWA propre Android/iPhone
    let deferredInstallPrompt = null;
    const isIosDevice = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandaloneApp = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const installDismissedRecently = () => {
      const ts = Number(localStorage.getItem('gm26_install_dismissed') || 0);
      return ts && (Date.now() - ts < 30 * 24 * 60 * 60 * 1000);
    };
    function showInstallBanner(force=false){
      const banner=document.getElementById('installBanner');
      if(!banner || isStandaloneApp()) return;
      const mobile=window.matchMedia('(max-width:780px)').matches;
      if(!force && (!mobile || installDismissedRecently())) return;
      banner.classList.add('show');
    }
    function hideInstallBanner(remember=true){
      document.getElementById('installBanner')?.classList.remove('show');
      if(remember) localStorage.setItem('gm26_install_dismissed', String(Date.now()));
    }
    function openInstallHelp(){
      hideInstallBanner(false);
      const help=document.getElementById('installHelp');
      if(help){help.classList.add('open');help.setAttribute('aria-hidden','false')}
    }
    function closeInstallHelp(remember=true){
      const help=document.getElementById('installHelp');
      if(help){help.classList.remove('open');help.setAttribute('aria-hidden','true')}
      if(remember) localStorage.setItem('gm26_install_dismissed', String(Date.now()));
    }
    async function handleInstallClick(){
      if(deferredInstallPrompt){
        deferredInstallPrompt.prompt();
        try{await deferredInstallPrompt.userChoice;}catch(e){}
        deferredInstallPrompt=null;
        hideInstallBanner(true);
        return;
      }
      openInstallHelp();
    }
    function setupInstallPrompt(){
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredInstallPrompt = e;
        showInstallBanner();
      });
      window.addEventListener('appinstalled', () => hideInstallBanner(true));
      document.getElementById('installBtn')?.addEventListener('click', handleInstallClick);
      document.getElementById('installClose')?.addEventListener('click', () => hideInstallBanner(true));
      document.getElementById('installLater')?.addEventListener('click', () => closeInstallHelp(false));
      document.getElementById('installUnderstood')?.addEventListener('click', () => closeInstallHelp(true));
      document.getElementById('installHelp')?.addEventListener('click', e => { if(e.target.id==='installHelp') closeInstallHelp(false); });
      setTimeout(() => {
        if(isIosDevice() || deferredInstallPrompt) showInstallBanner();
      }, 1600);
    }

    document.body.classList.toggle('home-active', (typeof activeTab==='undefined'||activeTab==='home'));
