const stadiums={"Mexico":"Estadio Azteca","Zapopan":"Estadio Akron","Guadalupe":"Estadio BBVA","Toronto":"BMO Field","Vancouver":"BC Place","Seattle":"Lumen Field","San Francisco":"Levi's Stadium","Los Angeles":"SoFi Stadium","Houston":"NRG Stadium","Dallas":"AT&T Stadium","Kansas City":"GEHA Field at Arrowhead Stadium","Atlanta":"Mercedes-Benz Stadium","Miami":"Hard Rock Stadium","Boston":"Gillette Stadium","Philadelphia":"Lincoln Financial Field","New York":"MetLife Stadium"};
let data = [
['2026-06-11','21:00','Groupe A','J1','Mexique','Afrique du Sud','Mexico','M6, beIN Sports'],['2026-06-12','04:00','Groupe A','J1','Corée du Sud','Rép. tchèque','Houston','beIN Sports'],['2026-06-12','21:00','Groupe B','J1','Canada','Bosnie-Herzégovine','Toronto','M6, beIN Sports'],['2026-06-13','03:00','Groupe D','J1','États-Unis','Paraguay','Los Angeles','beIN Sports'],['2026-06-13','21:00','Groupe B','J1','Qatar','Suisse','San Francisco','M6, beIN Sports'],['2026-06-14','00:00','Groupe C','J1','Brésil','Maroc','New York','M6, beIN Sports'],['2026-06-14','03:00','Groupe C','J1','Haïti','Écosse','Boston','beIN Sports'],['2026-06-14','06:00','Groupe D','J1','Australie','Turquie','Vancouver','beIN Sports'],['2026-06-14','19:00','Groupe E','J1','Allemagne','Curaçao','Houston','M6, beIN Sports'],['2026-06-14','22:00','Groupe F','J1','Pays-Bas','Japon','Dallas','M6, beIN Sports'],['2026-06-15','01:00','Groupe E','J1',"Côte d'Ivoire",'Equateur','Philadelphia','beIN Sports'],['2026-06-15','04:00','Groupe F','J1','Suède','Tunisie','Guadalupe','beIN Sports'],['2026-06-15','18:00','Groupe H','J1','Espagne','Cap-Vert','Atlanta','M6, beIN Sports'],['2026-06-15','21:00','Groupe G','J1','Belgique','Égypte','Seattle','M6, beIN Sports'],['2026-06-16','00:00','Groupe H','J1','Arabie saoudite','Uruguay','Miami','M6, beIN Sports'],['2026-06-16','03:00','Groupe G','J1','Iran','Nouvelle-Zélande','Los Angeles','beIN Sports'],['2026-06-16','21:00','Groupe I','J1','France','Sénégal','New York','M6, beIN Sports'],['2026-06-17','00:00','Groupe I','J1','Irak','Norvège','Boston','beIN Sports'],['2026-06-17','03:00','Groupe J','J1','Argentine','Algérie','Kansas City','beIN Sports'],['2026-06-17','06:00','Groupe J','J1','Autriche','Jordanie','San Francisco','beIN Sports'],['2026-06-17','19:00','Groupe K','J1','Portugal','RD Congo','Houston','M6, beIN Sports'],['2026-06-17','22:00','Groupe L','J1','Angleterre','Croatie','Dallas','M6, beIN Sports'],['2026-06-18','01:00','Groupe L','J1','Ghana','Panama','Toronto','beIN Sports'],['2026-06-18','04:00','Groupe K','J1','Ouzbékistan','Colombie','Mexico','beIN Sports'],['2026-06-18','18:00','Groupe A','J2','Rép. tchèque','Afrique du Sud','Atlanta','M6, beIN Sports'],['2026-06-18','21:00','Groupe B','J2','Suisse','Bosnie-Herzégovine','Los Angeles','M6, beIN Sports'],['2026-06-19','00:00','Groupe B','J2','Canada','Qatar','Vancouver','beIN Sports'],['2026-06-19','03:00','Groupe A','J2','Mexique','Corée du Sud','Zapopan','beIN Sports'],['2026-06-19','21:00','Groupe D','J2','États-Unis','Australie','Seattle','M6, beIN Sports'],['2026-06-20','00:00','Groupe C','J2','Écosse','Maroc','Boston','M6, beIN Sports'],['2026-06-20','03:00','Groupe C','J2','Brésil','Haïti','Philadelphia','beIN Sports'],['2026-06-20','06:00','Groupe D','J2','Turquie','Paraguay','San Francisco','beIN Sports'],['2026-06-20','19:00','Groupe F','J2','Pays-Bas','Suède','Houston','M6, beIN Sports'],['2026-06-20','22:00','Groupe E','J2','Allemagne',"Côte d'Ivoire",'Toronto','M6, beIN Sports'],['2026-06-21','02:00','Groupe E','J2','Equateur','Curaçao','Kansas City','beIN Sports'],['2026-06-21','06:00','Groupe F','J2','Tunisie','Japon','Guadalupe','beIN Sports'],['2026-06-21','18:00','Groupe H','J2','Espagne','Arabie saoudite','Atlanta','M6, beIN Sports'],['2026-06-21','21:00','Groupe G','J2','Belgique','Iran','Los Angeles','M6, beIN Sports'],['2026-06-22','00:00','Groupe H','J2','Uruguay','Cap-Vert','Miami','beIN Sports'],['2026-06-22','03:00','Groupe G','J2','Nouvelle-Zélande','Égypte','Vancouver','beIN Sports'],['2026-06-22','19:00','Groupe J','J2','Argentine','Autriche','Dallas','M6, beIN Sports'],['2026-06-22','23:00','Groupe I','J2','France','Irak','Philadelphia','M6, beIN Sports'],['2026-06-23','02:00','Groupe I','J2','Norvège','Sénégal','New York','beIN Sports'],['2026-06-23','05:00','Groupe J','J2','Jordanie','Algérie','San Francisco','beIN Sports'],['2026-06-23','19:00','Groupe K','J2','Portugal','Ouzbékistan','Houston','M6, beIN Sports'],['2026-06-23','22:00','Groupe L','J2','Angleterre','Ghana','Boston','M6, beIN Sports'],['2026-06-24','01:00','Groupe L','J2','Panama','Croatie','Toronto','beIN Sports'],['2026-06-24','04:00','Groupe K','J2','Colombie','RD Congo','Zapopan','beIN Sports'],['2026-06-24','21:00','Groupe B','J3','Suisse','Canada','Vancouver','M6, beIN Sports'],['2026-06-24','21:00','Groupe B','J3','Bosnie-Herzégovine','Qatar','Seattle','beIN Sports'],['2026-06-25','00:00','Groupe C','J3','Maroc','Haïti','Atlanta','beIN Sports'],['2026-06-25','00:00','Groupe C','J3','Écosse','Brésil','Miami','M6'],['2026-06-25','03:00','Groupe A','J3','Rép. tchèque','Mexique','Mexico','beIN Sports'],['2026-06-25','03:00','Groupe A','J3','Afrique du Sud','Corée du Sud','Guadalupe','beIN Sports'],['2026-06-25','22:00','Groupe E','J3','Curaçao',"Côte d'Ivoire",'Philadelphia','beIN Sports'],['2026-06-25','22:00','Groupe E','J3','Equateur','Allemagne','Toronto','M6, beIN Sports'],['2026-06-26','01:00','Groupe F','J3','Japon','Suède','Dallas','beIN Sports'],['2026-06-26','01:00','Groupe F','J3','Tunisie','Pays-Bas','Kansas City','M6, beIN Sports'],['2026-06-26','04:00','Groupe D','J3','Turquie','États-Unis','Los Angeles','beIN Sports'],['2026-06-26','04:00','Groupe D','J3','Paraguay','Australie','San Francisco','beIN Sports'],['2026-06-26','21:00','Groupe I','J3','Norvège','France','Boston','M6, beIN Sports'],['2026-06-26','21:00','Groupe I','J3','Sénégal','Irak','Toronto','beIN Sports'],['2026-06-27','02:00','Groupe H','J3','Uruguay','Espagne','Zapopan','M6, beIN Sports'],['2026-06-27','02:00','Groupe H','J3','Cap-Vert','Arabie saoudite','Houston','beIN Sports'],['2026-06-27','05:00','Groupe G','J3','Nouvelle-Zélande','Belgique','Vancouver','beIN Sports'],['2026-06-27','05:00','Groupe G','J3','Égypte','Iran','Seattle','beIN Sports'],['2026-06-27','23:00','Groupe L','J3','Panama','Angleterre','Dallas','M6, beIN Sports'],['2026-06-27','23:00','Groupe L','J3','Croatie','Ghana','Toronto','beIN Sports'],['2026-06-28','01:30','Groupe K','J3','Colombie','Portugal','Miami','M6, beIN Sports'],['2026-06-28','01:30','Groupe K','J3','RD Congo','Ouzbékistan','Atlanta','beIN Sports'],['2026-06-28','04:00','Groupe J','J3','Jordanie','Argentine','Dallas','beIN Sports'],['2026-06-28','04:00','Groupe J','J3','Algérie','Autriche','Kansas City','beIN Sports'],['2026-06-28','21:00','16es de finale','M73','Afrique du Sud','Canada','Los Angeles','M6, beIN Sports'],['2026-06-29','19:00','16es de finale','M74','Brésil','Japon','Houston','M6, beIN Sports'],['2026-06-29','22:30','16es de finale','M75','Allemagne','Paraguay','Philadelphia','M6, beIN Sports'],['2026-06-30','03:00','16es de finale','M76','Pays-Bas','Maroc','Dallas','beIN Sports'],['2026-06-30','19:00','16es de finale','M77',"Côte d'Ivoire",'Norvège','New York','M6, beIN Sports'],['2026-06-30','23:00','16es de finale','M78','France','Suède','Kansas City','M6, beIN Sports'],['2026-07-01','03:00','16es de finale','M79','Mexique','Equateur','Mexico','beIN Sports'],['2026-07-01','18:00','16es de finale','M80','Angleterre','RD Congo','Atlanta','M6, beIN Sports'],['2026-07-01','22:00','16es de finale','M81','Belgique','Sénégal','Seattle','beIN Sports'],['2026-07-02','02:00','16es de finale','M82','États-Unis','Bosnie-Herzégovine','San Francisco','beIN Sports'],['2026-07-02','21:00','16es de finale','M83','Espagne','Autriche','Los Angeles','M6, beIN Sports'],['2026-07-03','01:00','16es de finale','M84','Portugal','Croatie','Dallas','beIN Sports'],['2026-07-03','05:00','16es de finale','M85','Suisse','Algérie','Toronto','beIN Sports'],['2026-07-03','20:00','16es de finale','M86','Australie','Égypte','Miami','M6, beIN Sports'],['2026-07-04','00:00','16es de finale','M87','Argentine','Cap-Vert','Vancouver','beIN Sports'],['2026-07-04','04:00','16es de finale','M88','Colombie','Ghana','Boston','beIN Sports'],['2026-07-05','19:00','8es de finale','M89','Vainqueur M73','Vainqueur M74','Dallas','M6, beIN Sports'],['2026-07-05','23:00','8es de finale','M90','Vainqueur M75','Vainqueur M76','Atlanta','M6, beIN Sports'],['2026-07-06','19:00','8es de finale','M91','Vainqueur M77','Vainqueur M78','New York','M6, beIN Sports'],['2026-07-06','23:00','8es de finale','M92','Vainqueur M79','Vainqueur M80','Los Angeles','M6, beIN Sports'],['2026-07-07','19:00','8es de finale','M93','Vainqueur M81','Vainqueur M82','Houston','M6, beIN Sports'],['2026-07-07','23:00','8es de finale','M94','Vainqueur M83','Vainqueur M84','Seattle','beIN Sports'],['2026-07-08','19:00','8es de finale','M95','Vainqueur M85','Vainqueur M86','Miami','M6, beIN Sports'],['2026-07-08','23:00','8es de finale','M96','Vainqueur M87','Vainqueur M88','Kansas City','beIN Sports'],['2026-07-10','22:00','Quarts de finale','M97','Vainqueur M89','Vainqueur M90','New York','M6, beIN Sports'],['2026-07-11','02:00','Quarts de finale','M98','Vainqueur M91','Vainqueur M92','Los Angeles','M6, beIN Sports'],['2026-07-11','22:00','Quarts de finale','M99','Vainqueur M93','Vainqueur M94','Dallas','M6, beIN Sports'],['2026-07-12','02:00','Quarts de finale','M100','Vainqueur M95','Vainqueur M96','Atlanta','beIN Sports'],['2026-07-14','22:00','Demi-finales','M101','Vainqueur M97','Vainqueur M98','Los Angeles','M6, beIN Sports'],['2026-07-15','22:00','Demi-finales','M102','Vainqueur M99','Vainqueur M100','New York','M6, beIN Sports'],['2026-07-18','20:00','Match pour la 3e place','M103','Perdant M101','Perdant M102','Miami','beIN Sports'],['2026-07-19','20:00','Finale','M104','Vainqueur demi-finale 1','Vainqueur demi-finale 2','New York','M6, beIN Sports']
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
        predictionRows = await supabaseFetch('match_predictions?select=match_id,choice,user_key,user_id');
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
