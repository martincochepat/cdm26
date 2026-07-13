const EN_TO_FR = {
      'Mexico':'Mexique','South Africa':'Afrique du Sud','South Korea':'Corée du Sud',
      'Czechia':'Rép. tchèque','Czech Republic':'Rép. tchèque',
      'Canada':'Canada','Bosnia & Herzegovina':'Bosnie-Herzégovine',
      'Bosnia and Herzegovina':'Bosnie-Herzégovine',
      'USA':'États-Unis','United States':'États-Unis','Paraguay':'Paraguay',
      'Qatar':'Qatar','Switzerland':'Suisse','Brazil':'Brésil','Morocco':'Maroc',
      'Haiti':'Haïti','Scotland':'Écosse','Australia':'Australie','Turkey':'Turquie',
      'Turkiye':'Turquie','Germany':'Allemagne','Curacao':'Curaçao','Curaçao':'Curaçao',
      "Ivory Coast":"Côte d'Ivoire","Côte d'Ivoire":"Côte d'Ivoire",
      'Ecuador':'Equateur','Netherlands':'Pays-Bas','Japan':'Japon',
      'Sweden':'Suède','Tunisia':'Tunisie','Spain':'Espagne','Cape Verde':'Cap-Vert',
      'Belgium':'Belgique','Egypt':'Égypte','Saudi Arabia':'Arabie saoudite',
      'Uruguay':'Uruguay','Iran':'Iran','New Zealand':'Nouvelle-Zélande',
      'France':'France','Senegal':'Sénégal','Iraq':'Irak','Norway':'Norvège',
      'Argentina':'Argentine','Algeria':'Algérie','Austria':'Autriche','Jordan':'Jordanie',
      'Portugal':'Portugal','DR Congo':'RD Congo','Congo DR':'RD Congo',
      'Uzbekistan':'Ouzbékistan','Colombia':'Colombie','England':'Angleterre',
      'Croatia':'Croatie','Ghana':'Ghana','Panama':'Panama','Kosovo':'Kosovo',
      'Serbia':'Serbie','Poland':'Pologne','Denmark':'Danemark','Wales':'Pays de Galles',
      'Nigeria':'Nigeria','Cameroon':'Cameroun','Mali':'Mali','Zambia':'Zambie',
      'Jamaica':'Jamaïque','Honduras':'Honduras','El Salvador':'El Salvador',
      'Chile':'Chili','Peru':'Pérou','Venezuela':'Venezuela','Bolivia':'Bolivie',
      'Indonesia':'Indonésie','Iraq':'Irak','Syria':'Syrie','Bahrain':'Bahreïn',
      'UAE':'Émirats arabes unis','United Arab Emirates':'Émirats arabes unis',
    };
    function frName(name){ return EN_TO_FR[name] || name; }
    function isUnknownTeam(name){
      if(!name) return true;
      const n = String(name).toLowerCase();
      // Placeholder si contient des mots clés de slot
      if(n.includes('groupe') || n.includes('group') || n.includes('winner') ||
         n.includes('loser') || n.includes('vainqueur') || n.includes('perdant') ||
         n.includes('1er ') || n.match(/^\d/) ) return true;
      // Nom anglais non traduit (commence par majuscule, pas dans flags connus)
      const knownFr = ['mexique','france','brésil','argentine','allemagne','espagne',
        'portugal','angleterre','pays-bas','belgique','italie','suisse','croatie',
        'danemark','norvège','suède','autriche','pologne','serbie','turquie',
        'rép. tchèque','bosnie-herzégovine','maroc','sénégal','tunisie','égypte',
        "côte d'ivoire",'ghana','nigeria','algérie','cap-vert','japon','corée du sud',
        'iran','arabie saoudite','qatar','australie','nouvelle-zélande','irak','jordanie',
        'ouzbékistan','uruguay','colombie','paraguay','equateur','haïti','jamaïque',
        'panama','curaçao','canada','états-unis','mexique','afrique du sud','écosse',
        'rd congo','cap-vert','cape verde islands'];
      return false; // on ne bloque pas les noms inconnus, juste les placeholders
    }
    function isPlaceholderTeam(name){
      if(!name) return true;
      const n = String(name).toLowerCase();
      return n.includes('groupe') || n.includes('group') ||
        n.includes('vainqueur') || n.includes('winner') || n.includes('perdant') || n.includes('loser') ||
        n.includes('1er') || n.includes('2e') || n.includes('3e') || n.includes('2ème') || n.includes('3ème') ||
        /^[a-z]\d+$/.test(n.trim());
    }
    async function loadDynamicData(){
      try{
        const [matchRows, stadiumRows, eventRows] = await Promise.all([
          supabaseFetch('matches?select=*&order=date.asc,time_fr.asc'),
          supabaseFetch('stadiums?select=*'),
          supabaseFetch('match_events?select=match_id,api_fixture_id,elapsed,extra,event_type,detail,player_name,assist_name,team_name,comments&order=elapsed.asc')
        ]);
        (stadiumRows||[]).forEach(normalizeSupabaseStadium);
        matchEventsByMatchId = normalizeMatchEvents(eventRows);
        const dynamicMatches = (matchRows||[]).filter(r=>r && (r.date || r.team_a || r.team_b)).map(normalizeSupabaseMatch);
        const merged = new Map(localData.map(m=>[String(m.id), {...m}]));
        dynamicMatches.forEach(m=>{
          const local = merged.get(String(m.id));
          // Ignorer les matchs Supabase dont l'ID n'existe pas dans localData
          // (évite les doublons créés par d'anciennes données corrompues)
          if(!local) return;
          // Traduit les noms anglais API-Football en français
          const rawHome = frName(m.home);
          const rawAway = frName(m.away);
          if(m.winner && m.winner !== 'draw') m.winner = frName(m.winner);
          // Pour les matchs knockout : toujours garder les noms de localData (00-core-data.js)
          const isKnockout = !String(local.phase||'').startsWith('Groupe');
          if(isKnockout){
            // On mémorise l'ordre domicile/extérieur réel renvoyé par Supabase
            // (rawHome/rawAway) pour pouvoir, une fois les noms définitivement
            // résolus par resolveKnockoutSlots() plus bas, vérifier si l'ordre a
            // été inversé et permuter les scores en conséquence si besoin.
            m._supaHome = rawHome;
            m._supaAway = rawAway;
            m.home = local.home;
            m.away = local.away;
          } else {
            m.home = rawHome;
            m.away = rawAway;
          }
          // Repli sur les données locales (00-core-data.js) si Supabase ne
          // renseigne pas ville/stade/diffusion (ex: lignes phase finale
          // insérées manuellement sans ces infos).
          if(!m.city && local.city) m.city = local.city;
          if((!m.stadium || m.stadium==='Stade à confirmer') && local.stadium) m.stadium = local.stadium;
          if((!m.tv || m.tv==='À confirmer') && local.tv) m.tv = local.tv;
          merged.set(String(m.id), m);
        });
        data = [...merged.values()].sort((a,b)=>matchStart(a)-matchStart(b));
        // resolveKnockoutTeams(); // désactivé - noms en dur dans 00-core-data.js
        resolveKnockoutSlots();
        // Une fois les noms définitivement résolus, vérifie pour chaque match
        // knockout si l'ordre domicile/extérieur a été inversé par rapport à
        // Supabase, et permute les scores si besoin pour rester sur la bonne équipe.
        data.forEach(m=>{
          if(!m._supaHome || !m._supaAway || !m.home || !m.away) return;
          const namesMatch=(a,b)=>a && b && String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
          if(namesMatch(m._supaHome, m.away) && namesMatch(m._supaAway, m.home)){
            const sa=m.score_a, sb=m.score_b;
            m.score_a=sb; m.score_b=sa;
            const pa=m.pen_a, pb=m.pen_b;
            if(pa!==null || pb!==null){ m.pen_a=pb; m.pen_b=pa; }
          }
        });
        supabaseStatus = 'online';
        supabaseLastSync = new Date();
        renderAll();
        if(typeof currentUser !== 'undefined' && currentUser && typeof recalculateUserPoints === 'function'){
          recalculateUserPoints(currentUser.id).then(()=>{
            if(typeof loadLeaderboard === 'function') loadLeaderboard().then(()=>{
              if(typeof currentProfile !== 'undefined' && currentUser){
                loadProfile(currentUser.id).then(p=>{
                  if(p) currentProfile = p;
                  if(typeof updateChallengeData === 'function') updateChallengeData();
                });
              }
            });
          });
        }
      }catch(err){
        console.warn('Données dynamiques indisponibles, conservation des données locales.', err);
        supabaseStatus = 'offline';
      }
    }
    const flags={'France':'🇫🇷','Brésil':'🇧🇷','Argentine':'🇦🇷','Mexique':'🇲🇽','Canada':'🇨🇦','États-Unis':'🇺🇸','Allemagne':'🇩🇪','Espagne':'🇪🇸','Portugal':'🇵🇹','Angleterre':'🏴','Pays-Bas':'🇳🇱','Belgique':'🇧🇪','Italie':'🇮🇹','Suisse':'🇨🇭','Croatie':'🇭🇷','Danemark':'🇩🇰','Norvège':'🇳🇴','Suède':'🇸🇪','Écosse':'🏴','Autriche':'🇦🇹','Pologne':'🇵🇱','Serbie':'🇷🇸','Turquie':'🇹🇷','Ukraine':'🇺🇦','Rép. tchèque':'🇨🇿','Bosnie-Herzégovine':'🇧🇦','Russie':'🇷🇺','Maroc':'🇲🇦','Sénégal':'🇸🇳','Tunisie':'🇹🇳','Égypte':'🇪🇬','Afrique du Sud':'🇿🇦',"Côte d'Ivoire":'🇨🇮','Ghana':'🇬🇭','Nigeria':'🇳🇬','Algérie':'🇩🇿','Cap-Vert':'🇨🇻','Japon':'🇯🇵','Corée du Sud':'🇰🇷','Iran':'🇮🇷','Arabie saoudite':'🇸🇦','Qatar':'🇶🇦','Australie':'🇦🇺','Nouvelle-Zélande':'🇳🇿','Irak':'🇮🇶','Jordanie':'🇯🇴','Ouzbékistan':'🇺🇿','Uruguay':'🇺🇾','Colombie':'🇨🇴','Paraguay':'🇵🇾','Equateur':'🇪🇨','Équateur':'🇪🇨','Chili':'🇨🇱','Pérou':'🇵🇪','Venezuela':'🇻🇪','Haïti':'🇭🇹','Jamaïque':'🇯🇲','Panama':'🇵🇦','Curaçao':'🇨🇼'};
    const favs=new Set(JSON.parse(localStorage.getItem('wc26_favs')||'[]').map(String));
    const followedTeams=new Set(JSON.parse(localStorage.getItem('wc26_teams')||'["France"]')); let activeTab='home'; const $=id=>document.getElementById(id); const dateLabel=d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'}); const matchStart=m=>new Date(`${m.date}T${m.time}:00+02:00`); const matchEnd=m=>new Date(matchStart(m).getTime()+120*60000); const isLive=m=>new Date()>=matchStart(m)&&new Date()<=matchEnd(m); const isPast=m=>new Date()>matchEnd(m); const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const sameDay=(a,b)=>a.toDateString()===b.toDateString();
    
    function isMatchStillRelevantForTV(m){
      const status=String(m.status||'').toLowerCase();
      if(status==='finished' || status==='ft' || status==='aet' || status==='pen') return false;
      const start=matchStart(m);
      const end=new Date(start.getTime()+130*60000);
      return new Date() <= end;
    }

function countdown(m){let diff=matchStart(m)-new Date(); if(diff<=0) return isLive(m)?'En cours':'Terminé'; let d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),min=Math.floor(diff%3600000/60000); return d>0?`dans ${d}j ${h}h`:h>0?`dans ${h}h ${min}min`:`dans ${min}min`}
    function matchStatusKey(m){const s=String(m.status||'').toLowerCase(); if(['live','inplay','in_play','1h','2h','ht'].includes(s)) return 'live'; if(['finished','ft','ended','terminé','termine'].includes(s)) return 'finished'; if(s==='upcoming') return 'upcoming'; if(isLive(m)) return 'live'; if(isPast(m)) return 'finished'; return 'upcoming'}
    function hasScore(m){return m.score_a!==null && m.score_a!==undefined && m.score_a!=='' && m.score_b!==null && m.score_b!==undefined && m.score_b!==''}
    function statusBadge(m){let k=matchStatusKey(m); const s=String(m.status||'').toLowerCase(); if(s==='ht') return `<span class="tag"><span class="live-dot"></span> Mi-temps</span>`; if(k==='live') return `<span class="tag"><span class="live-dot"></span> EN DIRECT${m.minute?` · ${esc(m.minute)}'`:''}</span>`; if(k==='finished') return '<span class="tag">Terminé</span>'; return '<span class="tag">À venir</span>'}
    function scoreCenter(m){let k=matchStatusKey(m); if(hasScore(m)){let cls=k==='live'?'live-score':(k==='finished'?'finished-score':''); let label=k==='live'?(m.minute?`LIVE ${esc(m.minute)}'`:'LIVE'):(k==='finished'?'Terminé':'Score'); return `<div class="score-pill ${cls}"><div class="score-line">${esc(m.score_a)} - ${esc(m.score_b)}</div><div class="score-state">${label}</div></div>`} return '<div class="vs">VS</div>'}
    function scoreDetailBlock(m){if(!hasScore(m)) return ''; let k=matchStatusKey(m), label=k==='live'?(m.minute?`EN DIRECT · ${esc(m.minute)}'`:'EN DIRECT'):(k==='finished'?'TERMINÉ':'SCORE'); return `<div class="score-detail"><div class="score-detail-team">${flags[m.home]||'🏳️'} ${esc(m.home)}</div><div><div class="score-detail-center">${esc(m.score_a)} - ${esc(m.score_b)}</div><div class="score-detail-status">${label}</div></div><div class="score-detail-team away">${flags[m.away]||'🏳️'} ${esc(m.away)}</div></div>`}

    const venueMeta={
      'New York':{country:'États-Unis',lat:40.8135,lon:-74.0745,capacity:'82 500 places',timezone:'UTC-4',photo:'https://upload.wikimedia.org/wikipedia/commons/0/04/Metlife_stadium_%28Aerial_view%29.jpg',source:'FIFA / Wikimedia'},
      'Dallas':{country:'États-Unis',lat:32.7478,lon:-97.0928,capacity:'94 000 places',timezone:'UTC-5',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg/1600px-Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg',source:'FIFA / Wikimedia'},
      'Kansas City':{country:'États-Unis',lat:39.0489,lon:-94.4839,capacity:'73 000 places',timezone:'UTC-5',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg/1600px-Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg',source:'FIFA / Wikimedia'},
      'Houston':{country:'États-Unis',lat:29.6847,lon:-95.4108,capacity:'72 000 places',timezone:'UTC-5',photo:'https://upload.wikimedia.org/wikipedia/commons/3/3e/Nrg_stadium.jpg',source:'FIFA / Wikimedia'},
      'Atlanta':{country:'États-Unis',lat:33.7556,lon:-84.4000,capacity:'75 000 places',timezone:'UTC-4',photo:'https://upload.wikimedia.org/wikipedia/commons/1/10/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg',source:'FIFA / Wikimedia'},
      'Los Angeles':{country:'États-Unis',lat:33.9530,lon:-118.3390,capacity:'70 000 places',timezone:'UTC-7',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/1600px-SoFi_Stadium_2023.jpg',source:'FIFA / Wikimedia'},
      'Philadelphia':{country:'États-Unis',lat:39.9008,lon:-75.1675,capacity:'69 000 places',timezone:'UTC-4',photo:'https://upload.wikimedia.org/wikipedia/commons/a/a1/Lincoln_Financial_Field_%28Aerial_view%29.jpg',source:'FIFA / Wikimedia'},
      'Seattle':{country:'États-Unis',lat:47.5952,lon:-122.3316,capacity:'69 000 places',timezone:'UTC-7',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/2025_FIFA_Club_World_Cup_-_Seattle_Sounders_FC_vs._Atl%C3%A9tico_Madrid_-_05.jpg/1600px-2025_FIFA_Club_World_Cup_-_Seattle_Sounders_FC_vs._Atl%C3%A9tico_Madrid_-_05.jpg',source:'FIFA / Wikimedia'},
      'San Francisco':{country:'États-Unis',lat:37.4030,lon:-121.9700,capacity:'68 500 places',timezone:'UTC-7',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg/1600px-Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg',source:'FIFA / Wikimedia'},
      'Boston':{country:'États-Unis',lat:42.0910,lon:-71.2640,capacity:'65 000 places',timezone:'UTC-4',photo:'https://upload.wikimedia.org/wikipedia/commons/d/db/Gillette_Stadium_%28Top_View%29.jpg',source:'FIFA / Wikimedia'},
      'Miami':{country:'États-Unis',lat:25.9581,lon:-80.2389,capacity:'65 000 places',timezone:'UTC-4',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg/1600px-Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg',source:'FIFA / Wikimedia'},
      'Toronto':{country:'Canada',lat:43.6333,lon:-79.4186,capacity:'45 500 places',timezone:'UTC-4',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Toronto_BMO_Field_in_2024.jpg/1600px-Toronto_BMO_Field_in_2024.jpg',source:'FIFA / Wikimedia'},
      'Vancouver':{country:'Canada',lat:49.2767,lon:-123.1119,capacity:'54 500 places',timezone:'UTC-7',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/BC_Place_2015_Women%27s_FIFA_World_Cup.jpg/1600px-BC_Place_2015_Women%27s_FIFA_World_Cup.jpg',source:'FIFA / Wikimedia'},
      'Mexico':{country:'Mexique',lat:19.3031,lon:-99.1506,capacity:'83 000 places',timezone:'UTC-6',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg/1600px-Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg',source:'FIFA / Wikimedia'},
      'Zapopan':{country:'Mexique',lat:20.6817,lon:-103.4628,capacity:'49 850 places',timezone:'UTC-6',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_%283%29.jpg/1600px-Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_%283%29.jpg',source:'FIFA / Wikimedia'},
      'Guadalupe':{country:'Mexique',lat:25.6692,lon:-100.2444,capacity:'53 500 places',timezone:'UTC-6',photo:'https://upload.wikimedia.org/wikipedia/commons/5/57/Mexico_Guadalupe_Monterrey_Estadio_BBVA_Bancomer_fifa_world_cup_2026_6.JPG',source:'FIFA / Wikimedia'}
    };
    function mapPos(lat,lon){
      // Projection simplifiée centrée sur les 3 pays hôtes : Canada / USA / Mexique.
      // Cadre : longitudes -130 à -60, latitudes 12 à 60, pour placer les villes au bon endroit.
      let x=(lon+130)/70*100;
      let y=(60-lat)/48*100;
      return {x:Math.max(3,Math.min(97,x)).toFixed(1),y:Math.max(3,Math.min(96,y)).toFixed(1)}
    }
    const photoAlternates={
      'New York':['https://upload.wikimedia.org/wikipedia/commons/0/04/Metlife_stadium_%28Aerial_view%29.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Metlife_stadium_(Aerial_view).jpg'],
      'Dallas':['https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg/1600px-Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Arlington_June_2020_4_(AT%26T_Stadium).jpg'],
      'Kansas City':['https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg/1600px-Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg'],
      'Houston':['https://upload.wikimedia.org/wikipedia/commons/3/3e/Nrg_stadium.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Nrg_stadium.jpg'],
      'Atlanta':['https://upload.wikimedia.org/wikipedia/commons/1/10/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg'],
      'Los Angeles':['https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/1600px-SoFi_Stadium_2023.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/SoFi_Stadium_2023.jpg'],
      'Philadelphia':['https://upload.wikimedia.org/wikipedia/commons/a/a1/Lincoln_Financial_Field_%28Aerial_view%29.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Lincoln_Financial_Field_(Aerial_view).jpg'],
      'Seattle':['https://upload.wikimedia.org/wikipedia/commons/5/58/Lumen_Field_from_above%2C_2023.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/2025_FIFA_Club_World_Cup_-_Seattle_Sounders_FC_vs._Atl%C3%A9tico_Madrid_-_05.jpg/1600px-2025_FIFA_Club_World_Cup_-_Seattle_Sounders_FC_vs._Atl%C3%A9tico_Madrid_-_05.jpg'],
      'San Francisco':['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg/1600px-Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_(24398261729).jpg'],
      'Boston':['https://upload.wikimedia.org/wikipedia/commons/d/db/Gillette_Stadium_%28Top_View%29.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Gillette_Stadium_(Top_View).jpg'],
      'Miami':['https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg/1600px-Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Hard_Rock_Stadium_for_Super_Bowl_LIV_(49606710103).jpg'],
      'Toronto':['https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Toronto_BMO_Field_in_2024.jpg/1600px-Toronto_BMO_Field_in_2024.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Toronto_BMO_Field_in_2024.jpg'],
      'Vancouver':['https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/BC_Place_2015_Women%27s_FIFA_World_Cup.jpg/1600px-BC_Place_2015_Women%27s_FIFA_World_Cup.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/BC_Place_2015_Women%27s_FIFA_World_Cup.jpg'],
      'Mexico':['https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg/1600px-Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg'],
      'Zapopan':['https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_%283%29.jpg/1600px-Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_%283%29.jpg','https://commons.wikimedia.org/wiki/Special:FilePath/Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_(3).jpg'],
      'Guadalupe':['https://upload.wikimedia.org/wikipedia/commons/5/57/Mexico_Guadalupe_Monterrey_Estadio_BBVA_Bancomer_fifa_world_cup_2026_6.JPG','https://commons.wikimedia.org/wiki/Special:FilePath/Mexico_Guadalupe_Monterrey_Estadio_BBVA_Bancomer_fifa_world_cup_2026_6.JPG']
    };
    function photoList(city){let v=venueMeta[city]||{};return [v.photo,...(photoAlternates[city]||[])].filter(Boolean).filter((u,i,a)=>a.indexOf(u)===i)}
    function stadiumImageFallback(img,city,idx){let list=photoList(city);let next=idx+1;if(next<list.length){img.onerror=()=>stadiumImageFallback(img,city,next);img.src=list[next]}else{img.style.display='none';img.parentElement.classList.add('no-photo')}}
    function matchInsight(m){let free=m.tv.includes('M6');let knockout=!m.phase.includes('Groupe');let france=[m.home,m.away].includes('France'); if(france)return 'Match de la France : parfait pour l’afficher en haut, le mettre en favori et le partager facilement.'; if(knockout)return 'Match à élimination directe : prolongation et tirs au but possibles en cas d’égalité.'; if(free)return 'Diffusion gratuite indiquée : match intéressant à mettre en avant dans le Guide TV.'; return 'Match de phase de groupes : idéal pour suivre le parcours des équipes et préparer les favoris.'}

    function calendarUrl(m){let st=matchStart(m),en=matchEnd(m),fmt=d=>d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';let text=encodeURIComponent(`${m.home} vs ${m.away} - Coupe du Monde 2026`);let details=encodeURIComponent(`${m.phase} ${m.round} · ${m.stadium}, ${m.city} · Diffusion France : ${m.tv}`);let loc=encodeURIComponent(`${m.stadium}, ${m.city}`);return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(st)}/${fmt(en)}&details=${details}&location=${loc}`}
    function team(name,side='home'){return `<div class="team ${side}"><span class="flag">${flags[name]||'🏳️'}</span><span>${esc(name)}</span></div>`}
    function allTeams(){return [...new Set(data.flatMap(m=>[m.home,m.away]).filter(n=>!n.includes('Groupe')&&!n.includes('Vainqueur')))].sort((a,b)=>a.localeCompare(b,'fr'))}
    function init(){
      countAll.textContent=data.length;countM6.textContent=data.filter(m=>m.tv.includes('M6')).length;
      [...new Set(data.map(m=>m.phase))].forEach(v=>phase.innerHTML+=`<option>${v}</option>`);
      [...new Set(data.filter(m=>m.phase.startsWith('Groupe')).map(m=>m.phase))].forEach(v=>group.innerHTML+=`<option>${v}</option>`);
      ['Mes équipes','France','Matchs gratuits','M6','beIN Sports','Aujourd’hui + à venir','Finale','16es de finale','Favoris'].forEach(t=>quick.innerHTML+=`<span class="chip" data-v="${t}">${t}</span>`);
      ['q','phase','group','channel'].forEach(id=>{const el=$(id); el.addEventListener('input',renderAll); el.addEventListener('change',renderAll);});
      reset.onclick=()=>{q.value='';phase.value='';group.value='';channel.value='';renderAll()};
      quick.onclick=e=>{if(e.target.dataset.v)applyQuick(e.target.dataset.v)};
      nextBtn.onclick=goNext;shareBtn.onclick=shareApp;
      const tabsEl=$('tabs'); if(tabsEl){tabsEl.addEventListener('click',e=>{let btn=e.target.closest('[data-tab]'); if(btn){e.preventDefault(); switchTab(btn.dataset.tab)}})};
      renderTeamPicker();renderAll();loadDynamicData();loadPredictions();loadQuizQuestions();setInterval(loadDynamicData,30000);setInterval(loadPredictions,30000);setInterval(loadQuizQuestions,3600000);setInterval(renderAll,60000)
    }
    function scrollToActiveView(tab){
      const isMobile=window.matchMedia('(max-width:780px)').matches;
      let target=document.getElementById('view-'+tab) || document.getElementById('tabs') || document.body;
      if(tab==='matches' && isMobile){
        target=document.getElementById('list') || target;
      }
      const header=document.querySelector('.site-header');
      const offset=(header?.getBoundingClientRect().height||80)+(isMobile?14:22);
      const top=target.getBoundingClientRect().top+window.pageYOffset-offset;
      window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
    }
    function closeMobileMenu(){const d=document.getElementById('mobileDrawer'); if(d){d.classList.remove('open'); d.setAttribute('aria-hidden','true')}}
    function toggleMobileMenu(){const d=document.getElementById('mobileDrawer'); if(d){const open=!d.classList.contains('open'); d.classList.toggle('open',open); d.setAttribute('aria-hidden',open?'false':'true')}}
    function switchTab(tab,shouldScroll=true){activeTab=tab;document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.nav===tab));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));document.querySelectorAll('.mobile-drawer [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===tab));renderAll();closeMobileMenu();if(shouldScroll)setTimeout(()=>scrollToActiveView(tab),40)}
    function applyQuick(v){
      if(v==='Favoris'){showFavorites(); return}
      if(v==='Aujourd’hui + à venir'){q.value=q.value==='upcoming'?'':'upcoming'}
      else if(v==='Mes équipes'){q.value=q.value==='myteams'?'':'myteams'}
      else if(v==='Matchs gratuits'||v==='M6'){channel.value=channel.value==='M6'?'':'M6'}
      else if(v==='beIN Sports'){channel.value=channel.value===v?'':v}
      else if(v==='Finale'||v==='16es de finale'){phase.value=phase.value===v?'':v; q.value=''}
      else {q.value=q.value.toLowerCase()===v.toLowerCase()?'':v}
      activeTab='matches';renderAll();closeMobileMenu();setTimeout(()=>scrollToActiveView('matches'),40)
    }
    function showFavorites(){
      q.value='favoris';
      phase.value='';
      group.value='';
      channel.value='';
      activeTab='matches';
      renderAll();
      closeMobileMenu();
      setTimeout(()=>{
        const firstFav=[...favs][0];
        const target=firstFav?document.getElementById('match-'+String(firstFav)):null;
        if(target) target.scrollIntoView({behavior:'smooth',block:'center'});
        else scrollToActiveView('matches');
      },80);
    }
    function updateChips(){document.querySelectorAll('.chip').forEach(c=>{let v=c.dataset.v;let active=(v==='Aujourd’hui + à venir'&&q.value==='upcoming')||(v==='Favoris'&&q.value==='favoris')||(v==='Mes équipes'&&q.value==='myteams')||((v==='M6'||v==='Matchs gratuits')&&channel.value==='M6')||(v==='beIN Sports'&&channel.value==='beIN Sports')||((v==='Finale'||v==='16es de finale')&&phase.value===v)||(v==='France'&&q.value.toLowerCase()==='france');c.classList.toggle('active',active)})}
    function filtered(){let query=q.value.toLowerCase().trim(),ph=phase.value,gr=group.value,ch=channel.value;return data.filter(m=>{let blob=Object.values(m).join(' ').toLowerCase();let mine=followedTeams.has(m.home)||followedTeams.has(m.away);let okQ=!query||(query==='upcoming'?!isPast(m):query==='favoris'?favs.has(String(m.id)):query==='myteams'?mine:blob.includes(query));return okQ&&(!ph||m.phase===ph)&&(!gr||m.phase===gr)&&(!ch||m.tv.includes(ch))}).sort((a,b)=>matchStart(a)-matchStart(b))}

    // Résout les placeholders de phase finale ("1er Groupe A", "2e Groupe B", etc.)
    // depuis les classements calculés sur les matchs de poules terminés
    function resolveKnockoutTeams(){
      // Calcule classements groupe par groupe
      const standings = {}; // { 'Groupe A': ['Mexique','Corée du Sud','Rép. tchèque','Afrique du Sud'], ... }
      const groups = {};
      data.filter(m => String(m.phase||'').startsWith('Groupe')).forEach(m => {
        const g = m.phase;
        groups[g] = groups[g] || {};
        [m.home, m.away].forEach(t => {
          if(!t || isPlaceholderTeam(t)) return;
          groups[g][t] = groups[g][t] || {team:t,pts:0,gf:0,ga:0,gd:0,played:0};
        });
        const finished = ['finished','ft','terminé'].includes(String(m.status||'').toLowerCase()) && m.score_a !== null && m.score_b !== null;
        if(!finished) return;
        const a = groups[g][m.home], b = groups[g][m.away];
        if(!a || !b) return;
        const sa = Number(m.score_a), sb = Number(m.score_b);
        a.played++; b.played++;
        a.gf+=sa; a.ga+=sb; b.gf+=sb; b.ga+=sa;
        if(sa>sb){a.pts+=3;}else if(sa<sb){b.pts+=3;}else{a.pts+=1;b.pts+=1;}
        a.gd=a.gf-a.ga; b.gd=b.gf-b.ga;
      });
      Object.entries(groups).forEach(([g, teams]) => {
        standings[g] = Object.values(teams)
          .sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf || a.team.localeCompare(b.team,'fr'));
      });

      // Collecte tous les 3e de groupes pour les slots "3e Groupe X/Y/Z"
      const thirds = Object.values(standings)
        .map(arr => arr[2]).filter(Boolean)
        .sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf)
        .map(t => t.team);

      // Résout un placeholder en équipe réelle
      function resolve(placeholder) {
        if(!placeholder || !isPlaceholderTeam(placeholder)) return placeholder;
        const p = placeholder.toLowerCase().trim();

        // "1er Groupe A" → 1er du Groupe A
        const m1 = p.match(/1er\s+groupe\s+([a-z])/i);
        if(m1) {
          const key = Object.keys(standings).find(k => k.toLowerCase().endsWith(m1[1].toLowerCase()));
          return (key && standings[key][0]?.team) || placeholder;
        }

        // "2e Groupe A" → 2e du Groupe A
        const m2 = p.match(/2e\s+groupe\s+([a-z])/i);
        if(m2) {
          const key = Object.keys(standings).find(k => k.toLowerCase().endsWith(m2[1].toLowerCase()));
          return (key && standings[key][1]?.team) || placeholder;
        }

        // "3e Groupe A/B/C/D/F" → meilleur 3e parmi ces groupes
        const m3 = p.match(/3e\s+groupe\s+([a-z/]+)/i);
        if(m3) {
          const letters = m3[1].toUpperCase().split('/').map(l => l.trim());
          const best = thirds.find(team => {
            const teamGroup = Object.entries(standings).find(([g, arr]) => arr[2]?.team === team)?.[0];
            if(!teamGroup) return false;
            const letter = teamGroup.replace(/groupe\s*/i,'').trim().toUpperCase();
            return letters.includes(letter);
          });
          return best || placeholder;
        }

        // "Vainqueur demi-finale 1"
        const mv = p.match(/vainqueur\s+demi[- ]finale\s+(\d)/i);
        if(mv) {
          const semi = data.find(m => String(m.phase||'').toLowerCase().includes('demi') && String(m.round||'').includes(mv[1]));
          return (semi && semi.winner && !isPlaceholderTeam(semi.winner)) ? semi.winner : placeholder;
        }

        return placeholder;
      }

      // Applique la résolution sur tous les matchs knockout
      data.forEach(m => {
        if(!String(m.phase||'').startsWith('Groupe')) {
          const newHome = resolve(m.home);
          const newAway = resolve(m.away);
          if(newHome !== m.home) m.home = newHome;
          if(newAway !== m.away) m.away = newAway;
        }
      });
    }

    // Résout automatiquement les slots "Vainqueur M73", "Perdant M101" etc.
    // depuis les résultats déjà connus dans data
    function resolveKnockoutSlots(){
      // Construit un index round->id depuis localData (toujours fiable)
      const roundToId = {};
      localData.forEach(function(m){ if(m.round && m.round.match(/^M\d+$/)) roundToId[m.round] = String(m.id); });

      // Construit un index id->match depuis data (données live Supabase)
      function getById(id){ return data.find(function(x){ return String(x.id)===String(id); }); }

      function resolveSlot(slot){
        if(!slot) return null;
        const s = String(slot);
        // "Vainqueur M73"
        const mv = s.match(/^Vainqueur\s+(M\d+)$/i);
        if(mv){
          const id = roundToId[mv[1]];
          const ref = id ? getById(id) : null;
          if(ref && ref.winner && ref.winner !== 'draw' && ref.winner !== '') return ref.winner;
          return null; // pas encore connu -> garder slot
        }
        // "Perdant M101"
        const ml = s.match(/^Perdant\s+(M\d+)$/i);
        if(ml){
          const id = roundToId[ml[1]];
          const ref = id ? getById(id) : null;
          if(ref && ref.status === 'finished' && ref.winner && ref.winner !== 'draw'){
            return ref.winner === ref.home ? ref.away : ref.home;
          }
          return null;
        }
        return null;
      }

      // Réinitialise d'abord tous les slots knockout depuis localData
      // (évite que des résolutions incorrectes persistent)
      data.forEach(function(m){
        if(String(m.phase||'').startsWith('Groupe')) return;
        const local = localData.find(function(l){ return String(l.id)===String(m.id); });
        if(!local) return;
        // Réinitialise home/away si c'était un slot dans localData
        if(local.home && (local.home.startsWith('Vainqueur') || local.home.startsWith('Perdant'))) m.home = local.home;
        if(local.away && (local.away.startsWith('Vainqueur') || local.away.startsWith('Perdant'))) m.away = local.away;
      });

      // Résout en plusieurs passes (les 8es dépendent des 16es, les quarts des 8es, etc.)
      for(var pass=0; pass<4; pass++){
        data.forEach(function(m){
          if(String(m.phase||'').startsWith('Groupe')) return;
          const rh = resolveSlot(m.home);
          const ra = resolveSlot(m.away);
          if(rh) m.home = rh;
          if(ra) m.away = ra;
        });
      }
    }
