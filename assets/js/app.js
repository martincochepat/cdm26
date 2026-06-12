const stadiums={"Mexico":"Estadio Azteca","Zapopan":"Estadio Akron","Guadalupe":"Estadio BBVA","Toronto":"BMO Field","Vancouver":"BC Place","Seattle":"Lumen Field","San Francisco":"Levi's Stadium","Los Angeles":"SoFi Stadium","Houston":"NRG Stadium","Dallas":"AT&T Stadium","Kansas City":"GEHA Field at Arrowhead Stadium","Atlanta":"Mercedes-Benz Stadium","Miami":"Hard Rock Stadium","Boston":"Gillette Stadium","Philadelphia":"Lincoln Financial Field","New York":"MetLife Stadium"};
let data = [
['2026-06-11','21:00','Groupe A','J1','Mexique','Afrique du Sud','Mexico','M6, beIN Sports'],['2026-06-12','04:00','Groupe A','J1','Corée du Sud','Rép. tchèque','Houston','beIN Sports'],['2026-06-12','21:00','Groupe B','J1','Canada','Bosnie-Herzégovine','Toronto','M6, beIN Sports'],['2026-06-13','03:00','Groupe D','J1','États-Unis','Paraguay','Los Angeles','beIN Sports'],['2026-06-13','21:00','Groupe B','J1','Qatar','Suisse','San Francisco','M6, beIN Sports'],['2026-06-14','00:00','Groupe C','J1','Brésil','Maroc','New York','M6, beIN Sports'],['2026-06-14','03:00','Groupe C','J1','Haïti','Écosse','Boston','beIN Sports'],['2026-06-14','06:00','Groupe D','J1','Australie','Turquie','Vancouver','beIN Sports'],['2026-06-14','19:00','Groupe E','J1','Allemagne','Curaçao','Houston','M6, beIN Sports'],['2026-06-14','22:00','Groupe F','J1','Pays-Bas','Japon','Dallas','M6, beIN Sports'],['2026-06-15','01:00','Groupe E','J1',"Côte d'Ivoire",'Equateur','Philadelphia','beIN Sports'],['2026-06-15','04:00','Groupe F','J1','Suède','Tunisie','Guadalupe','beIN Sports'],['2026-06-15','18:00','Groupe H','J1','Espagne','Cap-Vert','Atlanta','M6, beIN Sports'],['2026-06-15','21:00','Groupe G','J1','Belgique','Égypte','Seattle','M6, beIN Sports'],['2026-06-16','00:00','Groupe H','J1','Arabie saoudite','Uruguay','Miami','M6, beIN Sports'],['2026-06-16','03:00','Groupe G','J1','Iran','Nouvelle-Zélande','Los Angeles','beIN Sports'],['2026-06-16','21:00','Groupe I','J1','France','Sénégal','New York','M6, beIN Sports'],['2026-06-17','00:00','Groupe I','J1','Irak','Norvège','Boston','beIN Sports'],['2026-06-17','03:00','Groupe J','J1','Argentine','Algérie','Kansas City','beIN Sports'],['2026-06-17','06:00','Groupe J','J1','Autriche','Jordanie','San Francisco','beIN Sports'],['2026-06-17','19:00','Groupe K','J1','Portugal','RD Congo','Houston','M6, beIN Sports'],['2026-06-17','22:00','Groupe L','J1','Angleterre','Croatie','Dallas','M6, beIN Sports'],['2026-06-18','01:00','Groupe L','J1','Ghana','Panama','Toronto','beIN Sports'],['2026-06-18','04:00','Groupe K','J1','Ouzbékistan','Colombie','Mexico','beIN Sports'],['2026-06-18','18:00','Groupe A','J2','Rép. tchèque','Afrique du Sud','Atlanta','M6, beIN Sports'],['2026-06-18','21:00','Groupe B','J2','Suisse','Bosnie-Herzégovine','Los Angeles','M6, beIN Sports'],['2026-06-19','00:00','Groupe B','J2','Canada','Qatar','Vancouver','beIN Sports'],['2026-06-19','03:00','Groupe A','J2','Mexique','Corée du Sud','Zapopan','beIN Sports'],['2026-06-19','21:00','Groupe D','J2','États-Unis','Australie','Seattle','M6, beIN Sports'],['2026-06-20','00:00','Groupe C','J2','Écosse','Maroc','Boston','M6, beIN Sports'],['2026-06-20','03:00','Groupe C','J2','Brésil','Haïti','Philadelphia','beIN Sports'],['2026-06-20','06:00','Groupe D','J2','Turquie','Paraguay','San Francisco','beIN Sports'],['2026-06-20','19:00','Groupe F','J2','Pays-Bas','Suède','Houston','M6, beIN Sports'],['2026-06-20','22:00','Groupe E','J2','Allemagne',"Côte d'Ivoire",'Toronto','M6, beIN Sports'],['2026-06-21','02:00','Groupe E','J2','Equateur','Curaçao','Kansas City','beIN Sports'],['2026-06-21','06:00','Groupe F','J2','Tunisie','Japon','Guadalupe','beIN Sports'],['2026-06-21','18:00','Groupe H','J2','Espagne','Arabie saoudite','Atlanta','M6, beIN Sports'],['2026-06-21','21:00','Groupe G','J2','Belgique','Iran','Los Angeles','M6, beIN Sports'],['2026-06-22','00:00','Groupe H','J2','Uruguay','Cap-Vert','Miami','beIN Sports'],['2026-06-22','03:00','Groupe G','J2','Nouvelle-Zélande','Égypte','Vancouver','beIN Sports'],['2026-06-22','19:00','Groupe J','J2','Argentine','Autriche','Dallas','M6, beIN Sports'],['2026-06-22','23:00','Groupe I','J2','France','Irak','Philadelphia','M6, beIN Sports'],['2026-06-23','02:00','Groupe I','J2','Norvège','Sénégal','New York','beIN Sports'],['2026-06-23','05:00','Groupe J','J2','Jordanie','Algérie','San Francisco','beIN Sports'],['2026-06-23','19:00','Groupe K','J2','Portugal','Ouzbékistan','Houston','M6, beIN Sports'],['2026-06-23','22:00','Groupe L','J2','Angleterre','Ghana','Boston','M6, beIN Sports'],['2026-06-24','01:00','Groupe L','J2','Panama','Croatie','Toronto','beIN Sports'],['2026-06-24','04:00','Groupe K','J2','Colombie','RD Congo','Zapopan','beIN Sports'],['2026-06-24','21:00','Groupe B','J3','Suisse','Canada','Vancouver','M6, beIN Sports'],['2026-06-24','21:00','Groupe B','J3','Bosnie-Herzégovine','Qatar','Seattle','beIN Sports'],['2026-06-25','00:00','Groupe C','J3','Maroc','Haïti','Atlanta','beIN Sports'],['2026-06-25','00:00','Groupe C','J3','Écosse','Brésil','Miami','M6'],['2026-06-25','03:00','Groupe A','J3','Rép. tchèque','Mexique','Mexico','beIN Sports'],['2026-06-25','03:00','Groupe A','J3','Afrique du Sud','Corée du Sud','Guadalupe','beIN Sports'],['2026-06-25','22:00','Groupe E','J3','Curaçao',"Côte d'Ivoire",'Philadelphia','beIN Sports'],['2026-06-25','22:00','Groupe E','J3','Equateur','Allemagne','Toronto','M6, beIN Sports'],['2026-06-26','01:00','Groupe F','J3','Japon','Suède','Dallas','beIN Sports'],['2026-06-26','01:00','Groupe F','J3','Tunisie','Pays-Bas','Kansas City','M6, beIN Sports'],['2026-06-26','04:00','Groupe D','J3','Turquie','États-Unis','Los Angeles','beIN Sports'],['2026-06-26','04:00','Groupe D','J3','Paraguay','Australie','San Francisco','beIN Sports'],['2026-06-26','21:00','Groupe I','J3','Norvège','France','Boston','M6, beIN Sports'],['2026-06-26','21:00','Groupe I','J3','Sénégal','Irak','Toronto','beIN Sports'],['2026-06-27','02:00','Groupe H','J3','Uruguay','Espagne','Zapopan','M6, beIN Sports'],['2026-06-27','02:00','Groupe H','J3','Cap-Vert','Arabie saoudite','Houston','beIN Sports'],['2026-06-27','05:00','Groupe G','J3','Nouvelle-Zélande','Belgique','Vancouver','beIN Sports'],['2026-06-27','05:00','Groupe G','J3','Égypte','Iran','Seattle','beIN Sports'],['2026-06-27','23:00','Groupe L','J3','Panama','Angleterre','Dallas','M6, beIN Sports'],['2026-06-27','23:00','Groupe L','J3','Croatie','Ghana','Toronto','beIN Sports'],['2026-06-28','01:30','Groupe K','J3','Colombie','Portugal','Miami','M6, beIN Sports'],['2026-06-28','01:30','Groupe K','J3','RD Congo','Ouzbékistan','Atlanta','beIN Sports'],['2026-06-28','04:00','Groupe J','J3','Jordanie','Argentine','Dallas','beIN Sports'],['2026-06-28','04:00','Groupe J','J3','Algérie','Autriche','Kansas City','beIN Sports'],['2026-06-28','21:00','16es de finale','M73','2e Groupe A','2e Groupe B','Los Angeles','M6, beIN Sports'],['2026-06-29','19:00','16es de finale','M74','1er Groupe C','2e Groupe F','Houston','M6, beIN Sports'],['2026-06-29','22:30','16es de finale','M75','1er Groupe E','3e Groupe A/B/C/D/F','Philadelphia','M6, beIN Sports'],['2026-06-30','03:00','16es de finale','M76','1er Groupe F','2e Groupe C','Dallas','beIN Sports'],['2026-06-30','19:00','16es de finale','M77','2e Groupe E','2e Groupe I','New York','M6, beIN Sports'],['2026-06-30','23:00','16es de finale','M78','1er Groupe I','3e Groupe C/D/F/G/H','Kansas City','M6, beIN Sports'],['2026-07-01','03:00','16es de finale','M79','1er Groupe A','3e Groupe C/E/F/H/I','Mexico','beIN Sports'],['2026-07-01','18:00','16es de finale','M80','1er Groupe L','3e Groupe E/H/I/J/K','Atlanta','M6, beIN Sports'],['2026-07-01','22:00','16es de finale','M81','1er Groupe G','3e Groupe A/E/H/I/J','Seattle','beIN Sports'],['2026-07-02','02:00','16es de finale','M82','1er Groupe D','3e Groupe B/E/F/I/J','San Francisco','beIN Sports'],['2026-07-02','21:00','16es de finale','M83','1er Groupe H','2e Groupe J','Los Angeles','M6, beIN Sports'],['2026-07-03','01:00','16es de finale','M84','2e Groupe K','2e Groupe L','Dallas','beIN Sports'],['2026-07-03','05:00','16es de finale','M85','1er Groupe B','3e Groupe E/F/G/I/J','Toronto','beIN Sports'],['2026-07-03','20:00','16es de finale','M86','2e Groupe D','2e Groupe G','Miami','M6, beIN Sports'],['2026-07-04','00:00','16es de finale','M87','1er Groupe J','2e Groupe H','Vancouver','beIN Sports'],['2026-07-04','04:00','16es de finale','M88','1er Groupe K','3e Groupe D/E/I/J/L','Boston','beIN Sports'],['2026-07-19','20:00','Finale','M104','Vainqueur demi-finale 1','Vainqueur demi-finale 2','New York','M6, beIN Sports']
].map((x,i)=>({id:i+1,date:x[0],time:x[1],phase:x[2],round:x[3],home:x[4],away:x[5],city:x[6],stadium:stadiums[x[6]]||'Stade à confirmer',tv:x[7]}));
    const localData = data.map(m=>({...m, id:String(m.id)}));
    data = localData.map(m=>({...m}));

    const SUPABASE_URL = 'https://lclnnxirkuuwexxcmmho.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_F-2bOXBmO23_FfRv5KTqXg_jP2osQM2';
    let supabaseLastSync = null;
    let supabaseStatus = 'local';
    let predictionRows = [];
    let predictionsLoaded = false;
    let quizRows = [];
    let quizLoaded = false;
    let matchEventsByMatchId = {};
    const predictionUserKey = (()=>{
      let key = localStorage.getItem('gm26_prediction_user_key');
      if(!key){
        key = (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'u-' + Date.now() + '-' + Math.random().toString(16).slice(2);
        localStorage.setItem('gm26_prediction_user_key', key);
      }
      return key;
    })();

    function jsArg(v){return '\'' + String(v).replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\''}
    function normalizeSupabaseMatch(row, index){
      const id = String(row.id ?? `supabase-${index}`);
      const tv = row.channel || row.tv || row.broadcast || 'À confirmer';
      const isFree = row.free_tv === true || String(tv).toLowerCase().includes('m6');
      return {
        id,
        date: row.date || row.match_date || '',
        time: row.time_fr || row.time || row.kickoff_time || '',
        phase: row.group_name || row.group || row.phase || 'À confirmer',
        round: row.round || row.matchday || row.phase || '',
        home: row.team_a || row.home || row.home_team || row.team_home || 'À confirmer',
        away: row.team_b || row.away || row.away_team || row.team_away || 'À confirmer',
        city: row.city || '',
        stadium: row.stadium || stadiums[row.city] || 'Stade à confirmer',
        tv: isFree && !String(tv).includes('M6') ? `${tv}, M6` : tv,
        status: row.status || 'upcoming',
        score_a: row.score_a === null || row.score_a === undefined || row.score_a === '' ? null : Number(row.score_a),
        score_b: row.score_b === null || row.score_b === undefined || row.score_b === '' ? null : Number(row.score_b),
        minute: row.minute === null || row.minute === undefined || row.minute === '' ? null : row.minute,
        winner: row.winner || '',
        _dynamic: true
      }
    }
    function normalizeSupabaseStadium(row){
      const city = row.city || row.id || row.name;
      if(!city) return;
      if(row.name) stadiums[city] = row.name;
      if(!venueMeta[city]) venueMeta[city] = {};
      if(row.country) venueMeta[city].country = row.country;
      if(row.capacity) venueMeta[city].capacity = String(row.capacity).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
      if(row.image_url) venueMeta[city].photo = row.image_url;
      if(row.latitude) venueMeta[city].lat = Number(row.latitude);
      if(row.longitude) venueMeta[city].lon = Number(row.longitude);
    }
    async function supabaseFetch(path){
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        cache: 'no-store'
      });
      if(!res.ok) throw new Error(`Supabase ${res.status}`);
      return res.json();
    }
    async function supabasePost(path, payload){
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method:'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type':'application/json',
          Prefer:'return=representation'
        },
        body: JSON.stringify(payload),
        cache:'no-store'
      });
      if(!res.ok){
        const msg = await res.text().catch(()=>`Supabase ${res.status}`);
        throw new Error(msg || `Supabase ${res.status}`);
      }
      return res.json();
    }
    async function loadPredictions(){
      try{
        predictionRows = await supabaseFetch('match_predictions?select=match_id,choice,user_key');
        predictionsLoaded = true;
        if(activeTab==='fan') renderFanZone();
      }catch(err){
        console.warn('Pronostics Supabase indisponibles.', err);
        predictionsLoaded = false;
      }
    }
    async function loadQuizQuestions(){
      try{
        const rows = await supabaseFetch('quiz_questions?select=*&order=id.asc');
        quizRows = Array.isArray(rows) ? rows.filter(r=>r && r.question) : [];
        quizLoaded = quizRows.length > 0;
        if(activeTab==='fan') renderFanZone();
      }catch(err){
        console.warn('Quiz Supabase indisponible, utilisation du quiz local.', err);
        quizLoaded = false;
      }
    }
    async function savePrediction(matchId, choice){
      return supabasePost('match_predictions', {match_id:String(matchId), choice:String(choice), user_key:predictionUserKey});
    }

    function normalizeMatchEvents(rows){
      const byMatch = {};
      (rows||[]).forEach(e=>{
        const key = String(e.match_id || '');
        if(!key) return;
        if(!byMatch[key]) byMatch[key] = [];
        byMatch[key].push(e);
      });
      Object.values(byMatch).forEach(list=>list.sort((a,b)=>Number(a.elapsed||0)-Number(b.elapsed||0) || Number(a.extra||0)-Number(b.extra||0)));
      return byMatch;
    }
    function matchEvents(m){return matchEventsByMatchId[String(m.id)] || []}
    function goalEvents(m){
      return matchEvents(m).filter(e=>{
        const type=String(e.event_type||'').toLowerCase();
        const detail=String(e.detail||'').toLowerCase();
        if(detail.includes('missed')) return false;
        return type==='goal' || detail.includes('goal') || detail.includes('penalty');
      });
    }
    function goalMinute(e){return `${esc(e.elapsed||'')}${e.extra?`+${esc(e.extra)}`:''}'`}
    function matchScorersMini(m){
      const goals=goalEvents(m);
      if(!goals.length) return '';
      return `<div class="match-scorers-mini"><b>Buteurs :</b> ${goals.map(e=>`⚽ ${goalMinute(e)} ${esc(e.player_name||'Buteur')} (${esc(e.team_name||'')})`).join(' · ')}</div>`;
    }
    function matchGoalsBlock(m){
      const goals=goalEvents(m);
      if(!goals.length) return '';
      return `<div class="goal-events"><h3>⚽ Buteurs</h3>${goals.map(e=>`<div class="goal-row"><span class="goal-minute">${goalMinute(e)}</span><div><span class="goal-player">${esc(e.player_name||'Buteur')}</span><span class="goal-meta">${esc(e.team_name||'')} ${e.assist_name?`· Passe : ${esc(e.assist_name)}`:''}${e.detail?` · ${esc(e.detail)}`:''}</span></div></div>`).join('')}</div>`;
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
        dynamicMatches.forEach(m=>merged.set(String(m.id), m));
        data = [...merged.values()].sort((a,b)=>matchStart(a)-matchStart(b));
        supabaseStatus = 'online';
        supabaseLastSync = new Date();
        renderAll();
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
    function statusBadge(m){let k=matchStatusKey(m); if(k==='live') return `<span class="tag"><span class="live-dot"></span> EN DIRECT${m.minute?` · ${esc(m.minute)}'`:''}</span>`; if(k==='finished') return '<span class="tag">Terminé</span>'; return '<span class="tag">À venir</span>'}
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
    function renderAll(){document.body.classList.toggle('home-active', activeTab==='home');
      document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===activeTab));
      document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.nav===activeTab));document.querySelectorAll('.mobile-drawer [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===activeTab));
      document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+activeTab));
      [renderHome,updateChips,renderHighlights,render,renderTeamsPage,renderStadiums,renderMapPage,renderTvGuide,renderGroups,renderBracket,renderFanZone].forEach(fn=>{try{fn()}catch(err){console.error('Render error:',fn.name,err)}});
    }
    function renderTeamPicker(){teamPicker.innerHTML=allTeams().map(t=>`<button class="team-chip ${followedTeams.has(t)?'on':''}" onclick="toggleTeam('${esc(t)}')">${flags[t]||'🏳️'} ${esc(t)}</button>`).join('')}
    function toggleTeam(t){followedTeams.has(t)?followedTeams.delete(t):followedTeams.add(t);localStorage.setItem('wc26_teams',JSON.stringify([...followedTeams]));renderTeamPicker();renderAll()}
    function smartDateLabel(m){
      const now=new Date(), d=matchStart(m);
      const tomorrow=new Date(now); tomorrow.setDate(now.getDate()+1);
      if(sameDay(d,now)) return 'Aujourd’hui';
      if(sameDay(d,tomorrow)) return 'Demain';
      return dateLabel(m.date).replace('2026','').trim();
    }
    function renderHome(){
      const now=new Date();
      const upcoming=data.filter(m=>matchStatusKey(m)==='upcoming').sort((a,b)=>matchStart(a)-matchStart(b));
      const liveMatches=data.filter(m=>matchStatusKey(m)==='live').sort((a,b)=>matchStart(a)-matchStart(b));
      const finished=data.filter(m=>matchStatusKey(m)==='finished').sort((a,b)=>matchStart(b)-matchStart(a));
      const mine=upcoming.filter(m=>followedTeams.has(m.home)||followedTeams.has(m.away));
      const today=data.filter(m=>sameDay(matchStart(m),now)).sort((a,b)=>matchStart(a)-matchStart(b));
      const tvToday=today.filter(m=>
        (m.tv.includes('M6')||m.tv.includes('beIN')) &&
        (matchStatusKey(m)==='live' || matchStatusKey(m)==='upcoming') &&
        !isPast(m)
      );
      const tvList=(tvToday.length?tvToday:upcoming.filter(m=>m.tv.includes('M6')||m.tv.includes('beIN'))).slice(0,3);
      const tvTitle=tvToday.length?'📺 Ce soir à la TV':'📺 Prochaines diffusions TV';
      const mainMatch=liveMatches[0] || upcoming[0] || finished[0];
      const mainStatus=mainMatch ? matchStatusKey(mainMatch) : 'upcoming';
      const mainTitle=mainStatus==='live'?'🔴 Match en cours':(mainStatus==='finished'?'✅ Dernier résultat':'⏳ Prochain match');
      const followed=[...followedTeams];
      if(mainMatch){
        featuredBox.innerHTML=`<h2 class="card-title">${mainTitle}</h2><div onclick="openDetail(${jsArg(mainMatch.id)})" style="cursor:pointer"><div class="match-feature-teams"><div class="match-feature-team"><span class="flag">${flags[mainMatch.home]||'🏳️'}</span>${esc(mainMatch.home)}</div>${scoreCenter(mainMatch)}<div class="match-feature-team"><span class="flag">${flags[mainMatch.away]||'🏳️'}</span>${esc(mainMatch.away)}</div></div><div class="match-meta-line"><span>${statusBadge(mainMatch)}</span><span>📅 ${smartDateLabel(mainMatch)} · ${mainMatch.time}</span><span>📍 ${esc(mainMatch.stadium)}, ${esc(mainMatch.city)}</span><span>📺 ${esc(mainMatch.tv)}</span></div></div><button class="home-btn" onclick="openDetail(${jsArg(mainMatch.id)})">Voir le détail →</button>`;
      }else featuredBox.innerHTML='<h2 class="card-title">⏳ Prochain match</h2><div class="empty-soft">Aucun match à afficher.</div>';
      freeTodayBox.innerHTML=`<h2 class="card-title">${tvTitle}</h2>${tvList.length?tvList.map(m=>`<div class="tv-mini-row" onclick="openDetail(${jsArg(m.id)})"><b>${m.time}</b><span>${flags[m.home]||'🏳️'} ${esc(m.home)}<br><small>vs ${flags[m.away]||'🏳️'} ${esc(m.away)} · ${smartDateLabel(m)}</small></span><span class="tv-channel">${m.tv.includes('M6')?'M6':'beIN'}</span></div>`).join(''):'<div class="empty-soft">Aucune diffusion TV à afficher.</div>'}<button class="home-btn" onclick="switchTab('tv')">Voir le guide TV →</button>`;
      const followedRows=followed.length?followed.slice(0,4).map(t=>{const next=upcoming.find(m=>m.home===t||m.away===t);return `<div class="follow-row"><span>${flags[t]||'🏳️'}</span><b>${esc(t)}</b><small>${next?`${smartDateLabel(next)} · ${next.time}`:''}</small></div>`}).join(''):'<div class="empty-soft">Choisissez vos équipes favorites.</div>';
      monMondialBox.innerHTML=`<h2 class="card-title">⭐ Mes équipes</h2>${followedRows}<div class="mini-details">${followedTeams.size} équipe(s) suivie(s) · ${favs.size} favori(s)</div><button class="home-btn" onclick="switchTab('teams')">Voir mes équipes →</button>`;
      const cities=[...new Set(data.map(m=>m.city))], city=cities[(new Date().getDate())%cities.length], v=venueMeta[city]||{}, img=photoList(city)[0]||'';
      stadiumDiscoveryBox.innerHTML=`<h2 class="card-title">🏟️ Stade du jour</h2><div class="stadium-day-photo" style="background-image:url('${img}')"></div><h3 style="margin:0 0 6px">${esc(stadiums[city]||city)}</h3><div class="match-meta-line"><span>📍 ${esc(city)}, ${esc(v.country||'')}</span><span>👥 ${esc(v.capacity||'Capacité à confirmer')}</span></div><button class="home-btn" onclick="openStadiumDetail('${esc(city)}')">Découvrir le stade →</button><button class="home-btn" style="margin-top:8px;background:#ffffff12;color:#fff;border-color:#ffffff24" onclick="openRandomStadium()">Découvrir un autre stade</button>`;
      homeUpcomingBox.innerHTML=`<h2 class="card-title">📅 Prochains matchs</h2>${upcoming.slice(0,5).map(m=>`<div class="upcoming-row" onclick="openDetail(${jsArg(m.id)})"><span>${smartDateLabel(m)}</span><b>${flags[m.home]||'🏳️'} ${esc(m.home)}<br><small>vs ${flags[m.away]||'🏳️'} ${esc(m.away)}</small></b><small>${m.time}</small></div>`).join('')||'<div class="empty-soft">Aucun match à venir.</div>'}<button class="home-btn" onclick="switchTab('matches')">Voir tous les matchs →</button>`;
      renderHeroInfoCard();
    }
    function renderHeroInfoCard(){
      const el=document.getElementById('heroInfoCard');
      if(!el) return;
      const live=data.filter(m=>String(m.status||'').toLowerCase()==='live'||isLive(m)).sort((a,b)=>matchStart(a)-matchStart(b))[0];
      const upcoming=data.filter(m=>!isPast(m)&&String(m.status||'').toLowerCase()!=='finished').sort((a,b)=>matchStart(a)-matchStart(b))[0];
      const finished=data.filter(m=>String(m.status||'').toLowerCase()==='finished'||isPast(m)).sort((a,b)=>matchStart(b)-matchStart(a))[0];
      const m=live||upcoming||finished;
      if(!m){
        el.innerHTML=`<div class="hero-info-eyebrow">🏆 Mondial 2026</div><div class="hero-info-title">104 matchs à suivre</div><div class="hero-info-sub">Calendrier, TV française, stades et favoris au même endroit.</div><div class="hero-info-meta"><div><b>16</b>villes hôtes</div><div><b>3</b>pays</div></div>`;
        return;
      }
      const status=live?'🔴 Match en cours':(upcoming?'⏳ Prochain match':'✅ Dernier résultat');
      const score=(hasScore(m)||live)?`<div class="hero-info-vs">${esc(m.score_a ?? 0)} - ${esc(m.score_b ?? 0)}</div>`:`<div class="hero-info-vs">VS</div>`;
      const minute=live&&m.minute?` · ${esc(m.minute)}'`:'';
      el.innerHTML=`<div class="hero-info-eyebrow">${status}${minute}</div><div class="hero-info-title">${flags[m.home]||'🏳️'} ${esc(m.home)}<br><span class="grad">${hasScore(m)||live?`${esc(m.score_a ?? 0)} - ${esc(m.score_b ?? 0)}`:'VS'}</span> ${flags[m.away]||'🏳️'} ${esc(m.away)}</div><div class="hero-info-sub">${smartDateLabel(m)} · ${esc(m.time)} · ${esc(m.city)}</div><div class="hero-info-meta"><div><b>Stade</b>${esc(m.stadium)}</div><div><b>Diffusion</b>${esc(m.tv)}</div></div><div class="hero-info-actions"><button onclick="openDetail(${jsArg(m.id)})">Voir le match</button><button class="secondary" onclick="switchTab('matches')">Calendrier</button></div>`;
    }

    function renderHighlights(){
      const now=new Date();
      const todays=data.filter(m=>sameDay(matchStart(m),now)).sort((a,b)=>matchStart(a)-matchStart(b));
      const upcoming=data.filter(m=>!isPast(m)).sort((a,b)=>matchStart(a)-matchStart(b));
      const favList=upcoming.filter(m=>favs.has(String(m.id)));
      const todayItems=(todays.length?todays:upcoming.slice(0,3)).slice(0,4).map(m=>`<div class="mini-match" onclick="openDetail(${jsArg(m.id)})"><div><div class="mini-teams">${flags[m.home]||'🏳️'} ${esc(m.home)} - ${flags[m.away]||'🏳️'} ${esc(m.away)}</div><div class="small">${dateLabel(m.date)} · ${m.time} · ${esc(m.tv)}</div></div></div>`).join('');
      todayBox.innerHTML=`<h2>${todays.length?'Matchs du jour':'Prochains matchs'}</h2>${todayItems||'<p class="small">Aucun match à afficher.</p>'}`;
      const tv=upcoming.filter(m=>m.tv.includes('M6')).slice(0,4).map(m=>`<div class="mini-match" onclick="openDetail(${jsArg(m.id)})"><div><div class="mini-teams">${flags[m.home]||'🏳️'} ${esc(m.home)} - ${flags[m.away]||'🏳️'} ${esc(m.away)}</div><div class="small">${dateLabel(m.date)} · ${m.time}</div></div><span class="free-badge">M6/M6+</span></div>`).join('');
      const mine=favList.length?`<p class="small"><b>${favList.length}</b> match(s) en favori. Clique sur le filtre Favoris pour les voir.</p>`:'<p class="small">Ajoute des favoris pour créer ton programme perso.</p>';
      tvBox.innerHTML=`<h2>Guide TV gratuit</h2>${tv||'<p class="small">Aucune diffusion M6 trouvée.</p>'}${mine}`;
    }
    function render(){let arr=filtered(),current='';list.innerHTML=arr.map(m=>{let k=matchStatusKey(m),live=k==='live',mine=followedTeams.has(m.home)||followedTeams.has(m.away),status=statusBadge(m),d=dateLabel(m.date),head=d!==current?(current=d,`<h3 class="date-title">${d}</h3>`):'',favBtn=`<button class="fav ${favs.has(String(m.id))?'on':''}" onclick="toggleFav(${jsArg(m.id)})">${favs.has(String(m.id))?'★ Favori':'☆ Favori'}</button>`;return `${head}<article class="match ${live?'live':''}" id="match-${esc(m.id)}"><div class="match-head"><span class="tag">${esc(m.round)} · ${esc(m.phase)}</span><div class="match-actions">${mine?'<span class="tag">Mon équipe</span>':''}${favBtn}<button class="detail-btn" onclick="openDetail(${jsArg(m.id)})">Détails</button>${status}</div></div><div class="teams">${team(m.home)}${scoreCenter(m)}${team(m.away,'away')}</div>${matchScorersMini(m)}${(matchStatusKey(m)!=='finished' && !isPast(m))?`<button class="quick-predict-btn" onclick="openDetail(${jsArg(m.id)})">🔥 Pronostiquer ce match</button>`:''}<div class="info"><div><b>Heure France</b><span class="time-main">${esc(m.time)}</span></div><div><b>Stade</b>${esc(m.stadium)}</div><div><b>Ville</b>${esc(m.city)}</div><div><b>Diffusion FR</b>${esc(m.tv)} ${m.tv.includes('M6')?'<br><span class="free-badge">gratuit M6/M6+</span>':''}</div></div></article>`}).join('')||'<div class="panel empty">Aucun match trouvé avec ces filtres.</div>'}

    function teamGroupName(t){
      const m=data.find(x=>x.home===t||x.away===t);
      return m && m.phase && m.phase.startsWith('Groupe') ? m.phase : 'Phase à confirmer';
    }
    function teamMatches(t){return data.filter(m=>m.home===t||m.away===t).sort((a,b)=>matchStart(a)-matchStart(b))}
    function renderTeamsPage(){
      const el=document.getElementById('teamsOverview'); if(!el) return;
      const teams=allTeams().sort((a,b)=>{
        const af=followedTeams.has(a)?0:1, bf=followedTeams.has(b)?0:1;
        return af-bf || a.localeCompare(b,'fr');
      });
      el.innerHTML=teams.map(t=>{
        const matches=teamMatches(t);
        const next=matches.find(m=>!isPast(m));
        const free=matches.filter(m=>m.tv.includes('M6')).length;
        return `<article class="team-card-premium ${followedTeams.has(t)?'followed':''}" onclick="openTeamDetail('${esc(t)}')"><div class="team-flag-big">${flags[t]||'🏳️'}</div><h3>${esc(t)}</h3><p>${esc(teamGroupName(t))}<br>${next?`Prochain match : ${dateLabel(next.date)} · ${next.time}`:'Calendrier à confirmer'}</p><div class="team-card-meta"><span>${matches.length} match(s)</span><span>${free} gratuit(s)</span>${followedTeams.has(t)?'<span>⭐ suivie</span>':'<span>+ suivre</span>'}</div></article>`;
      }).join('');
    }
    function openTeamDetail(t){
      const matches=teamMatches(t);
      const next=matches.find(m=>!isPast(m));
      const group=teamGroupName(t);
      const stadiumCities=[...new Set(matches.map(m=>m.city))];
      const freeCount=matches.filter(m=>m.tv.includes('M6')).length;
      modal.querySelector('.modal-card').classList.remove('stadium-modal');
      modal.querySelector('.modal-head b').textContent='Fiche équipe';
      modalBody.innerHTML=`<div class="team-detail-hero"><div class="flag-hero">${flags[t]||'🏳️'}</div><div><div class="tag">${esc(group)} · Coupe du Monde 2026</div><h2>${esc(t)}</h2><p>${matches.length} match(s) intégré(s) · ${freeCount} diffusion(s) gratuite(s) M6/M6+ · ${followedTeams.has(t)?'équipe suivie':'équipe non suivie'}</p></div></div><div class="metric-grid"><div class="metric"><b>Groupe</b>${esc(group)}</div><div class="metric"><b>Prochain match</b>${next?`${dateLabel(next.date)} · ${next.time}`:'À confirmer'}</div><div class="metric"><b>Matchs gratuits</b>${freeCount}</div></div><div class="team-detail-grid"><div class="team-detail-card"><h3>📅 Calendrier de l’équipe</h3>${matches.map(m=>{const opponent=m.home===t?m.away:m.home;return `<div class="team-match-row" onclick="openDetail(${jsArg(m.id)})"><b>${m.time}</b><span>${flags[t]||'🏳️'} ${esc(t)} vs ${flags[opponent]||'🏳️'} ${esc(opponent)}<br><small>${dateLabel(m.date)} · ${esc(m.city)} · ${esc(m.tv)}</small></span>${m.tv.includes('M6')?'<span class="free-badge">M6/M6+</span>':''}</div>`}).join('')||'<div class="empty-soft">Aucun match intégré.</div>'}</div><div class="team-detail-card"><h3>🏟️ Stades joués</h3>${stadiumCities.map(city=>`<div class="team-stadium-row" onclick="openStadiumDetail('${esc(city)}')"><b>📍</b><span>${esc(stadiums[city]||city)}<br><small>${esc(city)} · ${esc(venueMeta[city]?.country||'')}</small></span><span class="tag">Voir</span></div>`).join('')||'<div class="empty-soft">Aucun stade intégré.</div>'}<h3 style="margin-top:18px">🧭 Parcours</h3><div class="team-path"><div>Phase de groupes<span>${esc(group)}</span></div><div>16es de finale<span>Selon classement du groupe</span></div><div>Phase finale<span>À suivre pendant la compétition</span></div></div></div></div><div class="team-actions"><button onclick="toggleTeam('${esc(t)}');openTeamDetail('${esc(t)}')">${followedTeams.has(t)?'Ne plus suivre':'Suivre cette équipe'}</button><button onclick="q.value='${esc(t)}';switchTab('matches')">Voir ses matchs</button><button onclick="shareApp()">Partager le guide</button></div>`;
      openModal();
    }

    function renderStadiums(){const cities=Object.keys(venueMeta);stadiumGrid.innerHTML=cities.map(city=>{let v=venueMeta[city],n=data.filter(m=>m.city===city).length,img=photoList(city)[0]||'';return `<article class="stadium-card"><div class="stadium-img" style="background-image:url('${img}')"></div><div class="inner"><h3>${esc(stadiums[city]||city)}</h3><p class="small">${esc(city)} · ${esc(v.country)}<br>Capacité : <b>${esc(v.capacity)}</b><br>${n} match(s) intégrés</p><button onclick="openStadium('${esc(city)}')">Voir les matchs</button></div></article>`}).join('')}
    function openStadium(city){q.value=city;activeTab='matches';renderAll();setTimeout(()=>list.scrollIntoView({behavior:'smooth'}),80)}
    function renderMapPage(){bigHostMap.innerHTML=renderHostMap('', 'big');cityList.innerHTML=Object.keys(venueMeta).map(city=>{let v=venueMeta[city],n=data.filter(m=>m.city===city).length;return `<div class="city-pill" onclick="openStadiumDetail('${esc(city)}')"><b>📍 ${esc(city)}</b><br><span class="small">${esc(stadiums[city])} · ${n} match(s)</span></div>`}).join('')}
    function renderTvGuide(){const arr=data.filter(m=>!isPast(m)).sort((a,b)=>matchStart(a)-matchStart(b));let current='';tvGuideFull.innerHTML=arr.map(m=>{let d=dateLabel(m.date),head=d!==current?(current=d,`<h3 class="tv-day">${d}</h3>`):'';return `${head}<div class="tv-row" onclick="openDetail(${jsArg(m.id)})"><b>${m.time}</b><span>${flags[m.home]||'🏳️'} ${esc(m.home)} - ${flags[m.away]||'🏳️'} ${esc(m.away)}<br><small>${esc(m.stadium)} · ${esc(m.city)}</small></span><span>${m.tv.includes('M6')?'<span class="free-badge">M6/M6+</span> ':''}${esc(m.tv)}</span></div>`}).join('')}


    function groupData(){
      const groups={};
      data.filter(m=>m.phase.startsWith('Groupe')).forEach(m=>{groups[m.phase]??=new Set();[m.home,m.away].forEach(t=>{if(!t.includes('Groupe'))groups[m.phase].add(t)})});
      return Object.fromEntries(Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0],'fr')).map(([g,set])=>[g,[...set]]));
    }
    function calculateGroupStandings(){
      const groups = {};
      data.filter(m=>String(m.phase||'').startsWith('Groupe')).forEach(m=>{
        const g=m.phase;
        groups[g] ??= {};
        [m.home,m.away].forEach(t=>{
          if(!t || String(t).includes('Groupe')) return;
          groups[g][t] ??= {team:t, played:0, won:0, draw:0, lost:0, gf:0, ga:0, gd:0, pts:0};
        });
        const finished = matchStatusKey(m)==='finished' && hasScore(m);
        if(!finished) return;
        const a=groups[g][m.home], b=groups[g][m.away];
        if(!a || !b) return;
        const sa=Number(m.score_a), sb=Number(m.score_b);
        a.played++; b.played++;
        a.gf+=sa; a.ga+=sb; b.gf+=sb; b.ga+=sa;
        if(sa>sb){a.won++; b.lost++; a.pts+=3;}
        else if(sa<sb){b.won++; a.lost++; b.pts+=3;}
        else {a.draw++; b.draw++; a.pts+=1; b.pts+=1;}
        a.gd=a.gf-a.ga; b.gd=b.gf-b.ga;
      });
      return Object.fromEntries(Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0],'fr')).map(([g,teams])=>[
        g,
        Object.values(teams).sort((a,b)=> b.pts-a.pts || b.gd-a.gd || b.gf-a.gf || a.team.localeCompare(b.team,'fr'))
      ]));
    }
    function renderGroups(){
      if(!window.groupsGrid)return;
      const groups=calculateGroupStandings();
      groupsGrid.innerHTML=Object.entries(groups).map(([g,teams])=>{
        const hasResults=teams.some(t=>t.played>0);
        return `<article class="group-card ${hasResults?'has-results':''}"><h3>${esc(g)}</h3><table class="standings"><thead><tr><th class="rank">#</th><th>Équipe</th><th class="num">J</th><th class="num hide-mobile">G</th><th class="num hide-mobile">N</th><th class="num hide-mobile">P</th><th class="num">+/-</th><th class="num">Pts</th></tr></thead><tbody>${teams.map((t,i)=>{
          const gdClass=t.gd>0?'gd-positive':t.gd<0?'gd-negative':'';
          const gd=t.gd>0?`+${t.gd}`:String(t.gd);
          return `<tr><td class="rank">${i+1}</td><td class="team-cell">${flags[t.team]||'🏳️'} ${esc(t.team)}</td><td class="num">${t.played}</td><td class="num hide-mobile">${t.won}</td><td class="num hide-mobile">${t.draw}</td><td class="num hide-mobile">${t.lost}</td><td class="num ${gdClass}">${gd}</td><td class="num pts"><b>${t.pts}</b></td></tr>`
        }).join('')}</tbody></table><div class="group-note">${hasResults?'Classement calculé automatiquement depuis les scores terminés renseignés dans Supabase.':'Aucun match terminé pour ce groupe pour le moment.'}</div></article>`
      }).join('')
    }
    function renderBracket(){
      if(!window.bracketBox)return; const rounds=['16es de finale','8es de finale','Quarts de finale','Demi-finales','Finale'];
      bracketBox.innerHTML=rounds.map(r=>{let matches=data.filter(m=>m.phase===r|| (r==='Finale'&&m.phase==='Finale')).sort((a,b)=>matchStart(a)-matchStart(b)); if(!matches.length && r!=='Finale') matches=[]; return `<div class="round-col"><h3>${r}</h3>${matches.length?matches.map(m=>`<div class="bracket-match" onclick="openDetail(${jsArg(m.id)})"><b>${m.round} · ${dateLabel(m.date)} · ${m.time}</b>${flags[m.home]||'🏳️'} ${esc(m.home)}<br>${flags[m.away]||'🏳️'} ${esc(m.away)}<br><span class="mini">${esc(m.city)}</span></div>`).join(''):'<div class="bracket-match"><b>À venir</b>Équipes à confirmer selon les résultats des groupes.</div>'}</div>`}).join('')
    }
    const quizFallback=[{id:'local-1',question:'Combien de pays accueillent la Coupe du Monde 2026 ?',correct_answer:'3',options:['2','3','4','5']},{id:'local-2',question:'Quel stade accueille la finale intégrée dans ce guide ?',correct_answer:'MetLife Stadium',options:['SoFi Stadium','MetLife Stadium','AT&T Stadium','Estadio Azteca']},{id:'local-3',question:'Quel pays hôte joue le match d’ouverture ?',correct_answer:'Mexique',options:['Canada','Mexique','États-Unis','Brésil']}];
    function localDateKey(d=new Date()){
      const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    }
    function dayNumber(d=new Date()){
      const start = new Date('2026-06-11T00:00:00+02:00');
      const cur = new Date(`${localDateKey(d)}T00:00:00+02:00`);
      return Math.max(0, Math.floor((cur - start) / 86400000));
    }
    function normalizeQuizRow(row){
      if(!row) return null;
      const opts = [row.option_a,row.option_b,row.option_c,row.option_d].filter(Boolean).map(String);
      return {id:String(row.id||row.question),question:String(row.question||''),correct_answer:String(row.correct_answer||''),options:opts.length?opts:(row.options||[])};
    }
    function getDailyQuiz(){
      const source = quizLoaded && quizRows.length ? quizRows.map(normalizeQuizRow).filter(Boolean) : quizFallback;
      if(!source.length) return null;
      const item = source[dayNumber() % source.length];
      return item || source[0];
    }
    const pollOptionsFor=m=>[m.home,'Nul',m.away];
    function predictionStats(matchId){
      const id=String(matchId);
      const rows=(predictionRows||[]).filter(r=>String(r.match_id)===id);
      const counts={};
      rows.forEach(r=>{counts[r.choice]=(counts[r.choice]||0)+1});
      return {rows,counts,total:rows.length};
    }
    function myPrediction(matchId){
      const id=String(matchId);
      const row=(predictionRows||[]).find(r=>String(r.match_id)===id && String(r.user_key)===String(predictionUserKey));
      return row?.choice || '';
    }
    function renderPollMatch(m){
      const opts=pollOptionsFor(m);
      const {counts,total}=predictionStats(m.id);
      const voted=myPrediction(m.id);
      const loading=!predictionsLoaded;
      return `<div class="poll-match-card"><b>${flags[m.home]||'🏳️'} ${esc(m.home)} vs ${flags[m.away]||'🏳️'} ${esc(m.away)}</b><div class="mini">${dateLabel(m.date)} · ${m.time}${loading?' · chargement des votes globaux...':` · ${total} vote(s)`}</div>${opts.map(o=>{let pct=total?Math.round(((counts[o]||0)/total)*100):0;let selected=voted===o;return `<button class="poll-option ${selected?'good':''}" ${(voted||loading)?'disabled':''} onclick="votePoll(${jsArg(m.id)},'${esc(o)}')"><span>${esc(o)} ${selected?'✅':''}</span><b>${pct}%</b></button><div class="progress"><span style="width:${pct}%"></span></div>`}).join('')}${voted?`<div class="mini" style="margin-top:8px;color:#ffd166">Votre pronostic : <b>${esc(voted)}</b></div>`:''}</div>`;
    }
    function renderFanZone(){
      if(!window.quizBox)return;
      const todayKey=localDateKey();
      const item=getDailyQuiz();
      if(item){
        const quizKey=`wc26_quiz_${todayKey}_${item.id}`;
        const answered=localStorage.getItem(quizKey);
        const options=(item.options||[]).filter(Boolean);
        const sourceLabel=quizLoaded?'Question du jour Supabase':'Question locale de secours';
        quizBox.innerHTML=`<div class="mini" style="margin-bottom:8px;color:#adc0d2">${sourceLabel}</div><b>${esc(item.question)}</b>`+options.map(o=>`<button class="quiz-option ${answered? (o===item.correct_answer?'good':(o===answered?'bad':'')) : ''}" ${answered?'disabled':''} onclick="answerQuiz('${esc(quizKey)}','${esc(o)}')"><span>${esc(o)}</span>${answered&&o===item.correct_answer?'✅':''}</button>`).join('')+(answered?'<div class="mini" style="margin-top:8px;color:#ffd166">Nouveau quiz demain.</div>':'');
      }else{
        quizBox.innerHTML='<div class="empty-soft">Quiz indisponible pour le moment.</div>';
      }
      const now=new Date();
      let pollMatches=data.filter(m=>sameDay(matchStart(m),now)).sort((a,b)=>matchStart(a)-matchStart(b));
      let pollTitle='Pronostics du jour';
      if(!pollMatches.length){
        const next=data.filter(m=>!isPast(m)).sort((a,b)=>matchStart(a)-matchStart(b))[0];
        if(next){
          pollMatches=data.filter(m=>sameDay(matchStart(m),matchStart(next))).sort((a,b)=>matchStart(a)-matchStart(b));
          pollTitle='Prochains pronostics';
        }
      }
      pollBox.innerHTML=`<h3 style="margin:0 0 10px">🔥 ${pollTitle}</h3><p class="mini">Résultats globaux synchronisés entre les visiteurs.</p>${pollMatches.length?pollMatches.map(renderPollMatch).join(''):'<div class="empty-soft">Aucun match à pronostiquer.</div>'}`;
      if(window.fanStatsBox){
        const todayMatches=data.filter(m=>sameDay(matchStart(m),now)).sort((a,b)=>matchStart(a)-matchStart(b));
        const baseMatches=todayMatches.length?todayMatches:pollMatches;
        const freeCount=baseMatches.filter(m=>String(m.tv||'').includes('M6')).length;
        const totalVotes=(predictionRows||[]).length;
        const quizStatus=item?'Question prête':'Quiz indisponible';
        fanStatsBox.innerHTML=`<div class="metric-grid" style="grid-template-columns:1fr 1fr;margin:0 0 12px"><div class="metric"><b>Matchs affichés</b>${baseMatches.length}</div><div class="metric"><b>Diffusions gratuites</b>${freeCount}</div><div class="metric"><b>Votes enregistrés</b>${totalVotes}</div><div class="metric"><b>Quiz du jour</b>${quizStatus}</div></div><div class="empty-soft">Astuce : les pronostics sont globaux, synchronisés avec Supabase, et limités à un vote par match et par appareil.</div>`;
      }
    }
    function answerQuiz(quizKey,ans){localStorage.setItem(quizKey,ans);renderFanZone()}
    async function votePoll(id,opt){
      id=String(id);
      if(myPrediction(id)){renderFanZone();return}
      try{
        await savePrediction(id,opt);
        await loadPredictions();
      }catch(err){
        console.warn('Vote Supabase impossible.', err);
        alert('Vote déjà enregistré ou indisponible pour le moment.');
        await loadPredictions();
      }
      renderFanZone()
    }

    function renderHostMap(activeCity='', mode='compact'){
      const major=new Set(['New York','Dallas','Los Angeles','Mexico','Toronto','Vancouver']);
      const cities=Object.entries(venueMeta).map(([city,v])=>{const p=mapPos(v.lat,v.lon),n=data.filter(m=>m.city===city).length;return `<button type="button" class="city-dot map-click ${city===activeCity?'active':''} ${major.has(city)?'major':''}" data-city="${esc(city)}" data-stadium="${esc(stadiums[city]||'Stade')}" title="${esc(city)} — ${esc(stadiums[city]||'Stade')}" aria-label="Voir ${esc(stadiums[city]||'le stade')} à ${esc(city)}" style="left:${p.x}%;top:${p.y}%" onclick="openStadiumDetail('${esc(city)}')"></button>`}).join('');
      return `<div class="na-map ${mode==='big'?'big-map':''}"><div class="map-legend"><span>● Survole une ville</span><span>↗ Clique = fiche stade</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="canGrad2" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#42c3b7" stop-opacity=".74"/><stop offset="1" stop-color="#1d5e91" stop-opacity=".70"/></linearGradient>
          <linearGradient id="usaGrad2" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#348fc0" stop-opacity=".88"/><stop offset="1" stop-color="#214f7b" stop-opacity=".78"/></linearGradient>
          <linearGradient id="mexGrad2" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#44b875" stop-opacity=".88"/><stop offset="1" stop-color="#266c59" stop-opacity=".78"/></linearGradient>
        </defs>
        <path class="grid-line" d="M4 17 H96 M4 31 H96 M4 45 H96 M4 59 H96 M4 73 H96 M4 87 H96 M12 5 V95 M26 5 V95 M40 5 V95 M54 5 V95 M68 5 V95 M82 5 V95"/>
        <path class="land" fill="url(#canGrad2)" stroke="#ffffff55" stroke-width=".55" d="M4,8 L11,4 L22,7 L31,5 L42,7 L53,5 L65,9 L75,9 L88,14 L96,24 L92,32 L83,34 L76,31 L69,36 L61,35 L55,40 L47,38 L40,41 L31,38 L24,41 L14,36 L7,29 L5,20 Z"/>
        <path class="land" fill="url(#usaGrad2)" stroke="#ffffff66" stroke-width=".58" d="M8,39 L17,34 L27,36 L36,35 L45,38 L55,38 L66,38 L75,42 L83,49 L88,59 L84,70 L76,71 L70,63 L62,62 L55,68 L45,66 L36,62 L28,64 L20,72 L13,68 L10,57 Z"/>
        <path class="land" fill="url(#mexGrad2)" stroke="#ffffff66" stroke-width=".58" d="M17,72 L27,64 L37,65 L47,69 L55,76 L66,83 L72,92 L66,96 L56,91 L50,83 L41,79 L34,83 L26,80 L20,82 Z"/>
        <path class="land" fill="#2a86aa99" stroke="#ffffff55" stroke-width=".45" d="M9,52 L13,56 L15,66 L20,79 L17,82 L12,69 L8,61 Z"/>
        <path class="coast" d="M5,15 C18,8 36,12 50,9 C68,7 85,13 96,25"/>
        <path class="coast" d="M8,39 C22,33 34,39 45,38 C58,36 74,40 86,55 C91,66 84,74 76,71"/>
        <path class="coast" d="M18,72 C32,63 48,69 63,82 C70,88 72,93 66,96"/>
        <path class="border" d="M8,39 L17,34 L27,36 L36,35 L45,38 L55,38 L66,38 L75,42"/>
        <path class="border" d="M17,72 L27,64 L37,65 L47,69"/>
        <path class="city-guide" d="M10,26 C22,29 35,34 47,42 M47,42 C58,49 70,53 83,60 M38,68 C41,74 45,80 50,86"/>
        <text class="country-name" x="38" y="24">CANADA</text><text class="country-name" x="43" y="52">ÉTATS-UNIS</text><text class="country-name" x="36" y="79">MEXIQUE</text>
      </svg><span class="map-ocean">Atlantique</span><span class="map-compass">Pacifique ← · Nord ↑</span>${cities}</div>`
    }


    let __modalScrollY=0;
    function lockModalScroll(){
      __modalScrollY=window.scrollY||document.documentElement.scrollTop||0;
      document.documentElement.classList.add('modal-lock');
      document.body.classList.add('modal-lock');
      document.documentElement.style.overflow='hidden';
      document.body.style.overflow='hidden';
      document.body.style.position='fixed';
      document.body.style.top=`-${__modalScrollY}px`;
      document.body.style.left='0';
      document.body.style.right='0';
      document.body.style.width='100%';
      const drawer=document.getElementById('mobileDrawer');
      if(drawer){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true')}
    }
    function unlockModalScroll(){
      document.documentElement.classList.remove('modal-lock');
      document.body.classList.remove('modal-lock');
      document.documentElement.style.overflow='';
      document.body.style.overflow='';
      document.body.style.position='';
      document.body.style.top='';
      document.body.style.left='';
      document.body.style.right='';
      document.body.style.width='';
      window.scrollTo(0,__modalScrollY||0);
    }
    function openModal(){
      const mb=document.getElementById('modalBody');
      if(mb) mb.scrollTop=0;
      modal.classList.add('open');
      lockModalScroll();
    }

    function openStadiumDetail(city){
      let v=venueMeta[city]||{}, matches=data.filter(m=>m.city===city).sort((a,b)=>matchStart(a)-matchStart(b)), img=photoList(city)[0]||'';
      modal.querySelector('.modal-card').classList.add('stadium-modal');
      modal.querySelector('.modal-head b').textContent='Fiche du stade';
      modalBody.innerHTML=`<div class="tag">Ville hôte · ${esc(v.country||'')}</div><div class="detail-title">🏟️ ${esc(stadiums[city]||city)}</div><div class="venue-grid"><div class="venue-photo" data-label="${esc(stadiums[city]||'Stade')} — ${esc(city)}"><img src="${img}" alt="${esc(stadiums[city]||'Stade')}" loading="lazy" onerror="stadiumImageFallback(this,'${esc(city)}',0)"></div><div class="map-card"><div class="host-map-title"><b>Où se trouve la ville ?</b><span>Carte interactive</span></div><p class="small">Survole les autres points ou clique pour changer de stade.</p>${renderHostMap(city)}</div></div><div class="metric-grid"><div class="metric"><b>Ville</b>${esc(city)}</div><div class="metric"><b>Pays</b>${esc(v.country||'')}</div><div class="metric"><b>Capacité officielle FIFA</b>${esc(v.capacity||'À confirmer')}</div><div class="metric"><b>Fuseau local</b>${esc(v.timezone||'À confirmer')}</div><div class="metric"><b>Matchs intégrés</b>${matches.length}</div><div class="metric"><b>Stade</b>${esc(stadiums[city]||'')}</div></div><h3 class="section-title" style="margin-top:18px">Matchs dans ce stade</h3><div class="stadium-detail-list">${matches.map(m=>`<div class="mini-match" onclick="openDetail(${jsArg(m.id)})"><div><div class="mini-teams">${m.time} · ${flags[m.home]||'🏳️'} ${esc(m.home)} - ${flags[m.away]||'🏳️'} ${esc(m.away)}</div><div class="small">${dateLabel(m.date)} · ${esc(m.phase)} · ${esc(m.tv)}</div></div>${m.tv.includes('M6')?'<span class="free-badge">M6/M6+</span>':''}</div>`).join('')||'<div class="empty-soft">Aucun match intégré pour ce stade.</div>'}</div><div class="actions"><button onclick="showStadiumMatches('${esc(city)}')">Voir dans tous les matchs</button><button onclick="shareApp()">Partager l’app</button></div>`;
      openModal()
    }
    function showStadiumMatches(city){closeModal();q.value=city;activeTab='matches';renderAll();setTimeout(()=>list.scrollIntoView({behavior:'smooth'}),80)}

    function openRandomStadium(){
      const cities=Object.keys(venueMeta||{});
      if(!cities.length) return switchTab('stadiums');
      const city=cities[Math.floor(Math.random()*cities.length)];
      openStadiumDetail(city);
    }

    function openDetail(id){modal.querySelector('.modal-card').classList.remove('stadium-modal');modal.querySelector('.modal-head b').textContent='Détail du match';let m=data.find(x=>String(x.id)===String(id)); if(!m)return; let v=venueMeta[m.city]||{},pos=mapPos(v.lat||39,v.lon||-96); modalBody.innerHTML=`<div class="tag">${esc(m.round)} · ${esc(m.phase)}</div><div class="detail-title">${flags[m.home]||'🏳️'} ${esc(m.home)} <span class="grad">VS</span> ${flags[m.away]||'🏳️'} ${esc(m.away)}</div>${scoreDetailBlock(m)}${matchGoalsBlock(m)}<div id="predictionBox"></div><div class="venue-grid"><div class="venue-photo" data-label="${esc(m.stadium)} — ${esc(m.city)}"><img src="${photoList(m.city)[0]||''}" alt="${esc(m.stadium)}" loading="lazy" onerror="stadiumImageFallback(this,'${esc(m.city)}',0)"></div><div class="map-card"><div class="host-map-title"><b>Localisation du stade</b><span>Carte simplifiée</span></div><p class="small">Point placé sur la ville hôte : ${esc(m.city)} · ${esc(v.country||'Pays hôte')}</p>${renderHostMap(m.city)}</div></div><div class="metric-grid"><div class="metric"><b>Statut</b>${statusBadge(m)}</div><div class="metric"><b>Date</b>${dateLabel(m.date)}</div><div class="metric time-metric"><b>Heure française</b><span class="big-hour">${esc(m.time)}</span></div><div class="metric"><b>Stade</b>${esc(m.stadium)}</div><div class="metric"><b>Ville hôte</b>${esc(m.city)}</div><div class="metric"><b>Pays</b>${esc(v.country||'')}</div><div class="metric"><b>Capacité officielle FIFA</b>${esc(v.capacity||'À confirmer')}</div><div class="metric"><b>Diffusion France</b>${esc(m.tv)} ${m.tv.includes('M6')?'<br><span class="free-badge">gratuit M6/M6+</span>':''}</div></div><div class="actions"><button onclick="toggleFav(${jsArg(m.id)});openDetail(${jsArg(m.id)})">${favs.has(String(m.id))?'Retirer des favoris':'Ajouter aux favoris'}</button><button onclick="shareMatch(${jsArg(m.id)})">Partager ce match</button></div>`;openModal();renderPredictionBox(m.id)}
    function closeModal(){modal.classList.remove('open');unlockModalScroll();modal.querySelector('.modal-card').classList.remove('stadium-modal');modal.querySelector('.modal-head b').textContent='Détail du match'; const mb=document.getElementById('modalBody'); if(mb) mb.scrollTop=0;}
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open')) closeModal()});
    async function shareMatch(id){id=String(id);let m=data.find(x=>String(x.id)===id); if(!m)return;let text=`${m.home} vs ${m.away} · ${dateLabel(m.date)} à ${m.time} · ${m.stadium}, ${m.city} · Diffusion : ${m.tv}`; if(navigator.share) await navigator.share({title:'Coupe du Monde 2026',text,url:location.href}); else {await navigator.clipboard.writeText(text+' '+location.href); alert('Match copié !')}}
    function toggleFav(id){id=String(id);favs.has(id)?favs.delete(id):favs.add(id);localStorage.setItem('wc26_favs',JSON.stringify([...favs]));renderAll()}
    function goNext(){activeTab='matches';renderAll();let next=data.filter(m=>!isPast(m)).sort((a,b)=>matchStart(a)-matchStart(b))[0]; if(next) setTimeout(()=>document.getElementById('match-'+next.id)?.scrollIntoView({behavior:'smooth',block:'center'}),80)}
    async function shareApp(){let shareData={title:'Guide Mondial 2026',text:'Calendrier, guide TV France, stades et matchs de la Coupe du Monde 2026',url:location.href}; if(navigator.share) await navigator.share(shareData); else {await navigator.clipboard.writeText(location.href); alert('Lien copié !')}}

    function openSearch(){
      activeTab='matches';
      renderAll();
      closeMobileMenu();
      const toolbar=document.querySelector('#view-matches .toolbar');
      const input=document.getElementById('q');
      if(window.matchMedia('(max-width:780px)').matches){
        document.body.classList.add('mobile-search-open');
        setTimeout(()=>{ input?.focus(); },120);
      }else{
        document.body.classList.remove('mobile-search-open');
        setTimeout(()=>{
          toolbar?.scrollIntoView({behavior:'smooth',block:'start'});
          input?.focus();
        },80);
      }
    }
    function closeSearch(){
      document.body.classList.remove('mobile-search-open');
      const input=document.getElementById('q');
      input?.blur();
    }

    
    function scrollToNextMatchSoon(){
      if(activeTab!=='matches') return;
      setTimeout(()=>{
        const next=data.filter(m=>!isPast(m)).sort((a,b)=>matchStart(a)-matchStart(b))[0];
        if(!next) return;
        const el=document.getElementById('match-'+next.id);
        if(el){
          el.classList.add('next-match-anchor');
          el.scrollIntoView({behavior:'smooth',block:'start'});
        }
      },160);
    }

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

    // V76 — Pronostics visiteurs synchronisés Supabase
    const GM26_SUPABASE_URL='https://lclnnxirkuuwexxcmmho.supabase.co';
    const GM26_SUPABASE_KEY='sb_publishable_F-2bOXBmO23_FfRv5KTqXg_jP2osQM2';

    function predictionStorageKey(matchId){return 'gm26_prediction_'+String(matchId)}

    async function supabaseRequest(path, options={}){
      const headers=Object.assign({
        apikey:GM26_SUPABASE_KEY,
        Authorization:`Bearer ${GM26_SUPABASE_KEY}`,
        'Content-Type':'application/json'
      }, options.headers||{});
      const res=await fetch(`${GM26_SUPABASE_URL}/rest/v1/${path}`,Object.assign({headers,cache:'no-store'},options));
      if(!res.ok) throw new Error(await res.text());
      if(res.status===204) return null;
      const text=await res.text();
      return text?JSON.parse(text):null;
    }

    function predictionLabel(m,choice){
      if(choice==='home') return m.home;
      if(choice==='draw') return 'Match nul';
      if(choice==='away') return m.away;
      return choice;
    }

    async function fetchPredictions(matchId){
      try{
        const rows=await supabaseRequest(`match_predictions?select=choice,count&match_id=eq.${encodeURIComponent(matchId)}`);
        const totals={home:0,draw:0,away:0};
        (rows||[]).forEach(r=>{totals[r.choice]=Number(r.count||0)});
        return totals;
      }catch(e){
        console.warn('Pronostics indisponibles',e);
        return {home:0,draw:0,away:0};
      }
    }

    async function submitPrediction(matchId,choice){
      const key=predictionStorageKey(matchId);
      const previous=localStorage.getItem(key);
      if(previous) return previous;
      const res=await fetch(`${GM26_SUPABASE_URL}/rest/v1/rpc/increment_match_prediction`,{
        method:'POST',
        headers:{
          apikey:GM26_SUPABASE_KEY,
          Authorization:`Bearer ${GM26_SUPABASE_KEY}`,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({p_match_id:String(matchId),p_choice:choice})
      });
      if(!res.ok) throw new Error(await res.text());
      localStorage.setItem(key,choice);
      return choice;
    }

    async function renderPredictionBox(matchId){
      const box=document.getElementById('predictionBox');
      if(!box) return;
      const m=data.find(x=>String(x.id)===String(matchId));
      if(!m) return;
      if(matchStatusKey(m)==='finished' || isPast(m)){
        box.innerHTML=`<div class="prediction-card"><h3>🔒 Pronostic fermé</h3><p class="prediction-sub">Ce match est déjà terminé, les votes sont désactivés.</p></div>`;
        return;
      }
      const already=localStorage.getItem(predictionStorageKey(matchId));
      const totals=await fetchPredictions(matchId);
      const total=totals.home+totals.draw+totals.away;
      const options=['home','draw','away'];

      box.innerHTML=`<div class="prediction-card">
        <h3>🔥 Pronostic du match</h3>
        <p class="prediction-sub">Qui va gagner ? Vote une seule fois par appareil.</p>
        <div class="prediction-options">
          ${options.map(choice=>{
            const count=totals[choice]||0;
            const pct=total?Math.round(count*100/total):0;
            const selected=already===choice?'selected':'';
            return `<button class="prediction-option ${selected}" ${already?'disabled':''} onclick="votePrediction(${jsArg(matchId)},'${choice}')">
              <b>${esc(predictionLabel(m,choice))}</b>
              <span>${pct}% · ${count}</span>
              <div class="prediction-bar" style="grid-column:1/-1"><i style="width:${pct}%"></i></div>
            </button>`;
          }).join('')}
        </div>
        <span class="prediction-total">${total} vote${total>1?'s':''}</span>
        <div class="prediction-note">${already?'Merci pour ton vote ✅':'Les résultats s’actualisent après ton vote.'}</div>
      </div>`;
    }

    async function votePrediction(matchId,choice){
      try{
        await submitPrediction(matchId,choice);
        await renderPredictionBox(matchId);
      }catch(e){
        console.error(e);
        alert('Impossible d’enregistrer le pronostic pour le moment.');
      }
    }

    init();
    attachNavigation();
    setupInstallPrompt();
