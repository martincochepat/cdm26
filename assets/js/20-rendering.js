function renderAll(){document.body.classList.toggle('home-active', activeTab==='home');
      document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===activeTab));
      document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.nav===activeTab));document.querySelectorAll('.mobile-drawer [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===activeTab));
      document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+activeTab));
      [renderHome,renderLiveCenter,updateChips,renderHighlights,render,renderTeamsPage,renderStadiums,renderMapPage,renderTvGuide,renderGroups,renderBracket,renderFanZone].forEach(fn=>{try{fn()}catch(err){console.error('Render error:',fn.name,err)}});
      try{checkGoalAnimation()}catch(err){console.error('checkGoalAnimation error:',err)}
    }
    function renderTeamPicker(){teamPicker.innerHTML=allTeams().map(t=>`<button class="team-chip ${followedTeams.has(t)?'on':''}" onclick="toggleTeam('${esc(t)}')">${flags[t]||'🏳️'} ${esc(t)}</button>`).join('')}
    function toggleTeam(t){followedTeams.has(t)?followedTeams.delete(t):followedTeams.add(t);localStorage.setItem('wc26_teams',JSON.stringify([...followedTeams]));renderTeamPicker();renderAll()}
    function smartDateLabel(m){
      const now=new Date(), d=matchStart(m);
      const tomorrow=new Date(now); tomorrow.setDate(now.getDate()+1);
      if(sameDay(d,now)) return 'Aujourd\u2019hui';
      if(sameDay(d,tomorrow)) return 'Demain';
      return dateLabel(m.date).replace('2026','').trim();
    }
    function renderHome(){
      const now=new Date();
      const upcoming=data.filter(m=>matchStatusKey(m)==='upcoming').sort((a,b)=>matchStart(a)-matchStart(b));
      const liveMatches=data.filter(m=>matchStatusKey(m)==='live').sort((a,b)=>matchStart(a)-matchStart(b));
      const finished=data.filter(m=>matchStatusKey(m)==='finished').sort((a,b)=>matchStart(b)-matchStart(a));
      const today=data.filter(m=>sameDay(matchStart(m),now)).sort((a,b)=>matchStart(a)-matchStart(b));
      const tvToday=today.filter(m=>(m.tv.includes('M6')||m.tv.includes('beIN'))&&(matchStatusKey(m)==='live'||matchStatusKey(m)==='upcoming')&&!isPast(m));
      const tvList=(tvToday.length?tvToday:upcoming.filter(m=>m.tv.includes('M6')||m.tv.includes('beIN'))).slice(0,3);
      const tvTitle=tvToday.length?'Ce soir à la TV':'Prochaines diffusions TV';
      const mainMatch=liveMatches[0]||upcoming[0]||finished[0];
      const lastResult=finished[0]; // pour le bloc "dernier résultat" séparé
      const mainStatus=mainMatch?matchStatusKey(mainMatch):'upcoming';
      const followed=[...followedTeams];

      // ── FEATURED BOX (premium, style Flashscore) ──────────────
      if(mainMatch){
        const isLive=mainStatus==='live';
        const isDone=mainStatus==='finished';
        const scored=mainMatch.score_a!==null&&mainMatch.score_a!==undefined&&mainMatch.score_b!==null&&mainMatch.score_b!==undefined;
        const wH=isDone&&mainMatch.winner?(mainMatch.winner===mainMatch.home):(isDone&&scored&&Number(mainMatch.score_a)>Number(mainMatch.score_b));
        const wA=isDone&&mainMatch.winner?(mainMatch.winner===mainMatch.away):(isDone&&scored&&Number(mainMatch.score_b)>Number(mainMatch.score_a));
        const freeTV=mainMatch.tv&&mainMatch.tv.includes('M6');

        const events=matchEventsByMatchId[String(mainMatch.id)]||[];
        const goals=events.filter(e=>{
          const t=String(e.event_type||'').toLowerCase(),d=String(e.detail||'').toLowerCase();
          return !d.includes('missed')&&(t==='goal'||d.includes('goal')||d.includes('penalty'));
        });
        const homeGoals=goals.filter(e=>e.team_name===mainMatch.home||frName(e.team_name)===mainMatch.home);
        const awayGoals=goals.filter(e=>e.team_name===mainMatch.away||frName(e.team_name)===mainMatch.away);

        const statusBadgeHtml=isLive
          ?`<span class="hm-live-badge">● EN DIRECT${liveLabel(mainMatch)?' · '+liveLabel(mainMatch):''}</span>`
          :isDone?`<span class="hm-done-badge">✓ Terminé</span>`
          :`<span class="hm-next-badge">⏳ À venir</span>`;

        const pct=isLive&&mainMatch.minute?Math.min(100,Math.round((Number(mainMatch.minute)/90)*100)):isDone?100:0;
        const progressHtml=isLive||isDone?`<div class="hm-progress"><div class="hm-progress-bar${isLive?' hm-progress-live':''}" style="width:${pct}%"></div></div>`:'';

        const scorerLine=(goals)=>goals.length
          ?`<div class="hm-scorers">${goals.map(e=>`<span>⚽ ${e.elapsed?e.elapsed+"'":''}  ${esc(e.player_name||'But')}</span>`).join('')}</div>`:'';

        const penHtml=(mainMatch.pen_a!=null&&mainMatch.pen_b!=null)?`<div class="hm-pen">Tirs au but : ${mainMatch.pen_a}-${mainMatch.pen_b}</div>`:'';

        // ── Onglets (uniquement pertinents si live ou terminé) ──
        const showTabs=isLive||isDone;
        const tabsNav=showTabs?`
          <div class="hm-fz-tabs">
            <button class="hm-fz-tab hm-fz-tab-active" data-tab="resume" onclick="setFeaturedTab('resume')">Résumé</button>
            <button class="hm-fz-tab" data-tab="stats" onclick="setFeaturedTab('stats')">Stats</button>
            <button class="hm-fz-tab" data-tab="lineups" onclick="setFeaturedTab('lineups')">Compositions</button>
          </div>`:'';

        // ── Panel Résumé : timeline complète ──
        function eventIcon(e){
          const t=String(e.event_type||'').toLowerCase(),d=String(e.detail||'').toLowerCase();
          if(t==='goal'&&d.includes('own')) return '⚽🔴';
          if(t==='goal') return '⚽';
          if(t==='card'&&d.includes('yellow')) return '🟨';
          if(t==='card'&&d.includes('red')) return '🟥';
          if(t==='subst') return '🔄';
          return '•';
        }
        function eventDesc(e){
          const t=String(e.event_type||'').toLowerCase();
          if(t==='goal') return `${esc(e.player_name||'But')}${e.assist_name?' <span class="hm-fz-sub">(passe: '+esc(e.assist_name)+')</span>':''}`;
          if(t==='card') return `${esc(e.player_name||'')} <span class="hm-fz-sub">${esc(e.detail||'')}</span>`;
          if(t==='subst') return `↑ ${esc(e.player_name||'')} <span class="hm-fz-sub">↓ ${esc(e.assist_name||'')}</span>`;
          return esc(e.player_name||'');
        }
        const allEvents=[...events].sort((a,b)=>Number(a.elapsed||0)-Number(b.elapsed||0));
        const resumePanel=allEvents.length?`
          <div class="hm-fz-timeline">
            ${allEvents.map(e=>{
              const isHome=e.team_name===mainMatch.home||frName(e.team_name)===mainMatch.home;
              return `<div class="hm-fz-event ${isHome?'hm-fz-event-home':'hm-fz-event-away'}">
                <div class="hm-fz-min">${e.elapsed?e.elapsed+"'":''}${e.extra?'+'+e.extra:''}</div>
                <div class="hm-fz-icon">${eventIcon(e)}</div>
                <div class="hm-fz-desc">${eventDesc(e)}</div>
              </div>`;
            }).join('')}
          </div>`:`<div class="hm-fz-empty">${isLive?'Aucun événement pour le moment.':isDone?'Aucun événement enregistré.':''}</div>`;

        // ── Panel Stats (placeholder, chargé en async) ──
        const statsPanel=`<div id="hmStatsPanel" class="hm-fz-stats-loading">Chargement des statistiques...</div>`;

        // ── Panel Compositions (placeholder, chargé en async) ──
        const lineupsPanel=`<div id="hmLineupsPanel" class="hm-fz-stats-loading">Chargement des compositions...</div>`;

        const panelsHtml=showTabs?`
          <div class="hm-fz-panel" data-panel="resume">${resumePanel}</div>
          <div class="hm-fz-panel" data-panel="stats" style="display:none">${statsPanel}</div>
          <div class="hm-fz-panel" data-panel="lineups" style="display:none">${lineupsPanel}</div>
        `:'';

        featuredBox.innerHTML=`
          <div class="hm-title-eyebrow">${isLive?'🔴 Match en cours':isDone?'✅ Dernier résultat':'⏳ Prochain match'}</div>
          <div class="hm-match-header">
            <span class="hm-phase-tag">${esc(mainMatch.phase)}${mainMatch.round&&mainMatch.round!==mainMatch.phase?' · '+esc(mainMatch.round):''}</span>
            <div class="hm-match-actions">
              <button class="fav ${favs.has(String(mainMatch.id))?'on':''}" onclick="toggleFav(${jsArg(mainMatch.id)})">${favs.has(String(mainMatch.id))?'★':'☆'}</button>
              ${statusBadgeHtml}
            </div>
          </div>
          <div class="hm-teams" onclick="openDetail(${jsArg(mainMatch.id)})">
            <div class="hm-team ${wH?'hm-winner':''}">
              <span class="hm-flag">${flags[mainMatch.home]||'🏳️'}</span>
              <span class="hm-team-name">${esc(mainMatch.home)}</span>
              ${scorerLine(homeGoals)}
            </div>
            <div class="hm-score-block">
              ${scored
                ?`<div class="hm-score${isLive?' hm-score-live':''}">${mainMatch.score_a} <span class="hm-score-sep">-</span> ${mainMatch.score_b}</div>` + penHtml
                :`<div class="hm-vs">VS</div><div class="hm-kickoff">${esc(mainMatch.time)}</div>`
              }
            </div>
            <div class="hm-team hm-team-right ${wA?'hm-winner':''}">
              <span class="hm-team-name">${esc(mainMatch.away)}</span>
              <span class="hm-flag">${flags[mainMatch.away]||'🏳️'}</span>
              ${scorerLine(awayGoals)}
            </div>
          </div>
          ${progressHtml}
          ${tabsNav}
          ${panelsHtml}
          <div class="hm-meta-grid">
            <div class="hm-meta-item"><span class="hm-meta-label">📅 Date</span><span class="hm-meta-val">${smartDateLabel(mainMatch)}</span></div>
            <div class="hm-meta-item"><span class="hm-meta-label">⏰ Heure</span><span class="hm-meta-val">${esc(mainMatch.time)}</span></div>
            <div class="hm-meta-item"><span class="hm-meta-label">🏟️ Stade</span><span class="hm-meta-val">${esc(mainMatch.stadium)}</span></div>
            <div class="hm-meta-item"><span class="hm-meta-label">📍 Ville</span><span class="hm-meta-val">${esc(mainMatch.city)}</span></div>
            <div class="hm-meta-item"><span class="hm-meta-label">📺 Diffusion</span><span class="hm-meta-val">${esc(mainMatch.tv)}${freeTV?' <span class="hm-free">Gratuit</span>':''}</span></div>
          </div>
          <button class="home-btn home-btn-primary" onclick="openDetail(${jsArg(mainMatch.id)})">Voir le détail complet →</button>
        `;

        // Charger stats + lineups si en direct ou terminé et fixture_id dispo
        if(mainMatch.api_fixture_id && showTabs){
          loadFeaturedStats(mainMatch);
          loadFeaturedLineups(mainMatch);
        }
      } else {
        featuredBox.innerHTML='<h2 class="card-title">⏳ Prochain match</h2><div class="empty-soft">Aucun match à afficher.</div>';
      }

      // ── DERNIER RÉSULTAT (bloc compact, si différent du featured) ──
      if(document.getElementById('lastResultBox')){
        const lrBox=document.getElementById('lastResultBox');
        if(lastResult && lastResult.id!==mainMatch?.id){
          const lrEvents=matchEventsByMatchId[String(lastResult.id)]||[];
          const lrGoals=lrEvents.filter(e=>{
            const t=String(e.event_type||'').toLowerCase(),d=String(e.detail||'').toLowerCase();
            return !d.includes('missed')&&(t==='goal'||d.includes('goal')||d.includes('penalty'));
          });
          const lrWinner=lastResult.winner;
          const lrWH=lrWinner&&lrWinner===lastResult.home;
          const lrWA=lrWinner&&lrWinner===lastResult.away;
          const lrPen=(lastResult.pen_a!=null&&lastResult.pen_b!=null)?` <span class="lr-pen">(tab ${lastResult.pen_a}-${lastResult.pen_b})</span>`:'';
          lrBox.innerHTML=`
            <div class="lr-eyebrow">Dernier résultat · ${esc(lastResult.phase)}</div>
            <div class="lr-match" onclick="openDetail(${jsArg(lastResult.id)})">
              <div class="lr-teams">
                <div class="lr-team ${lrWH?'lr-winner':''}"><span class="lr-flag">${flags[lastResult.home]||'🏳️'}</span><span class="lr-name">${esc(lastResult.home)}</span></div>
                <div class="lr-score">${lastResult.score_a} - ${lastResult.score_b}${lrPen}</div>
                <div class="lr-team lr-team-right ${lrWA?'lr-winner':''}"><span class="lr-name">${esc(lastResult.away)}</span><span class="lr-flag">${flags[lastResult.away]||'🏳️'}</span></div>
              </div>
              ${lrGoals.length?`<div class="lr-goals">${lrGoals.slice(0,4).map(e=>`⚽ ${e.elapsed?e.elapsed+"'":''} ${esc(e.player_name||'')}`).join(' &nbsp;·&nbsp; ')}</div>`:''}
              <div class="lr-cta">Voir les statistiques complètes <span class="lr-arrow">→</span></div>
            </div>
          `;
        } else {
          lrBox.style.display='none';
        }
      }

      // ── CE SOIR À LA TV ────────────────────────────────────────
      freeTodayBox.innerHTML=`
        <h2 class="card-title">📺 ${tvTitle}</h2>
        ${tvList.length?tvList.map(m=>`
          <div class="hm-tv-row" onclick="openDetail(${jsArg(m.id)})">
            <div class="hm-tv-time">${m.time}</div>
            <div class="hm-tv-match">
              <div class="hm-tv-teams">${flags[m.home]||'🏳️'} <b>${esc(m.home)}</b> <span style="color:#8fa6bd;margin:0 4px">vs</span> ${flags[m.away]||'🏳️'} <b>${esc(m.away)}</b></div>
              <div class="hm-tv-meta">${smartDateLabel(m)} · ${esc(m.phase)}</div>
            </div>
            <div class="hm-tv-badge">${m.tv.includes('M6')?'<span class="hm-m6">M6</span>':''}<span class="hm-bein">beIN</span></div>
          </div>
        `).join(''):'<div class="empty-soft">Aucune diffusion TV à afficher.</div>'}
        <button class="home-btn home-btn-secondary" onclick="switchTab('tv')">Voir le guide TV →</button>
      `;

      // ── MON MONDIAL ────────────────────────────────────────────
      const followedRows=followed.length?followed.slice(0,4).map(t=>{
        const next=upcoming.find(m=>m.home===t||m.away===t);
        return `<div class="follow-row"><span>${flags[t]||'🏳️'}</span><b>${esc(t)}</b><small>${next?`${smartDateLabel(next)} · ${next.time}`:''}</small></div>`;
      }).join(''):'<div class="empty-soft">Choisissez vos équipes favorites.</div>';
      monMondialBox.innerHTML=`<h2 class="card-title">⭐ Mes équipes</h2>${followedRows}<div class="mini-details">${followedTeams.size} équipe(s) suivie(s) · ${favs.size} favori(s)</div><button class="home-btn" onclick="switchTab('teams')">Voir mes équipes →</button>`;

      // ── STADE DU JOUR ──────────────────────────────────────────
      const cities=[...new Set(data.map(m=>m.city))],city=cities[(new Date().getDate())%cities.length],v=venueMeta[city]||{},img=photoList(city)[0]||'';
      stadiumDiscoveryBox.innerHTML=`<h2 class="card-title">🏟️ Stade du jour</h2><div class="stadium-day-photo" style="background-image:url('${img}')"></div><h3 style="margin:0 0 6px">${esc(stadiums[city]||city)}</h3><div class="match-meta-line"><span>📍 ${esc(city)}, ${esc(v.country||'')}</span><span>👥 ${esc(v.capacity||'Capacité à confirmer')}</span></div><button class="home-btn" onclick="openStadiumDetail('${esc(city)}')">Découvrir le stade →</button><button class="home-btn" style="margin-top:8px;background:#ffffff12;color:#fff;border-color:#ffffff24" onclick="openRandomStadium()">Découvrir un autre stade</button>`;

      // ── PROCHAINS MATCHS ───────────────────────────────────────
      homeUpcomingBox.innerHTML=`
        <h2 class="card-title">📅 Prochains matchs</h2>
        ${upcoming.slice(0,5).map(m=>`
          <div class="hm-upcoming-row" onclick="openDetail(${jsArg(m.id)})">
            <div class="hm-upc-date">
              <b>${smartDateLabel(m)}</b>
              <span>${m.time}</span>
            </div>
            <div class="hm-upc-match">
              <div class="hm-upc-teams">${flags[m.home]||'🏳️'} <b>${esc(m.home)}</b> <span style="color:#8fa6bd;font-size:11px;margin:0 3px">vs</span> ${flags[m.away]||'🏳️'} <b>${esc(m.away)}</b></div>
              <div class="hm-upc-meta">${esc(m.phase)} · ${esc(m.city)}</div>
            </div>
            <div class="hm-upc-tv">
              ${m.tv.includes('M6')?'<span class="hm-m6">M6</span>':''}
              ${m.tv.includes('beIN')?'<span class="hm-bein">beIN</span>':''}
            </div>
          </div>
        `).join('')||'<div class="empty-soft">Aucun match à venir.</div>'}
        <button class="home-btn home-btn-secondary" onclick="switchTab('matches')">Voir tous les matchs →</button>
      `;

      renderHeroInfoCard();
    }

    function renderHeroInfoCard(){
      const el=document.getElementById('heroInfoCard');
      if(!el) return;
      const live=data.filter(m=>matchStatusKey(m)==='live').sort((a,b)=>matchStart(a)-matchStart(b))[0];
      const upcoming=data.filter(m=>matchStatusKey(m)==='upcoming').sort((a,b)=>matchStart(a)-matchStart(b))[0];
      const finished=data.filter(m=>matchStatusKey(m)==='finished').sort((a,b)=>matchStart(b)-matchStart(a))[0];
      const m=live||upcoming||finished;
      if(!m){
        el.innerHTML=`<div class="hero-info-eyebrow">🏆 Mondial 2026</div><div class="hero-info-title">104 matchs à suivre</div><div class="hero-info-sub">Calendrier, TV française, stades et favoris au même endroit.</div><div class="hero-info-meta"><div><b>16</b>villes hôtes</div><div><b>3</b>pays</div></div>`;
        return;
      }
      const isLive=!!live, isDone=!live&&!upcoming&&!!finished;
      const status=isLive?'🔴 Match en cours':(isDone?'✅ Dernier résultat':'⏳ Prochain match');
      const minute=isLive&&m.minute?` · ${esc(m.minute)}'`:'';
      const scored=m.score_a!==null&&m.score_a!==undefined&&m.score_b!==null&&m.score_b!==undefined;
      el.innerHTML=`<div class="hero-info-eyebrow">${status}${minute}</div><div class="hero-info-title">${flags[m.home]||'🏳️'} ${esc(m.home)}<br><span class="grad">${scored||isLive?`${esc(m.score_a??0)} - ${esc(m.score_b??0)}`:'VS'}</span> ${flags[m.away]||'🏳️'} ${esc(m.away)}</div><div class="hero-info-sub">${smartDateLabel(m)} · ${esc(m.time)} · ${esc(m.city)}</div><div class="hero-info-meta"><div><b>Stade</b>${esc(m.stadium)}</div><div><b>Diffusion</b>${esc(m.tv)}</div></div><div class="hero-info-actions"><button onclick="openDetail(${jsArg(m.id)})">Voir le match</button><button class="secondary" onclick="switchTab('matches')">Calendrier</button></div>`;
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
    function render(){let arr=filtered(),current='';list.innerHTML=arr.map(m=>{let k=matchStatusKey(m),live=k==='live',mine=followedTeams.has(m.home)||followedTeams.has(m.away),status=statusBadge(m),d=dateLabel(m.date),head=d!==current?(current=d,`<h3 class="date-title">${d}</h3>`):'',favBtn=`<button class="fav ${favs.has(String(m.id))?'on':''}" onclick="toggleFav(${jsArg(m.id)})">${favs.has(String(m.id))?'★ Favori':'☆ Favori'}</button>`;return `${head}<article class="match ${live?'live':''}" id="match-${esc(m.id)}"><div class="match-head"><span class="tag">${esc(m.round)} · ${esc(m.phase)}</span><div class="match-actions">${mine?'<span class="tag">Mon équipe</span>':''}${favBtn}<button class="detail-btn" onclick="openDetail(${jsArg(m.id)})">Détails</button>${status}</div></div><div class="teams">${team(m.home)}${scoreCenter(m)}${team(m.away,'away')}</div>${(m.pen_a!=null&&m.pen_b!=null)?`<div class="list-pen">Tirs au but : <b>${m.pen_a} - ${m.pen_b}</b></div>`:''}${matchScorersMini(m)}${(matchStatusKey(m)!=='finished' && !isPast(m))?(typeof myPredictionForMatch==='function' && myPredictionForMatch(m.id)?`<button class="quick-predict-btn quick-predict-done" onclick="openDetail(${jsArg(m.id)})">✏️ Modifier mon pronostic</button>`:`<button class="quick-predict-btn" onclick="openDetail(${jsArg(m.id)})">🔥 Pronostiquer ce match</button>`):''}<div class="info"><div><b>Heure France</b><span class="time-main">${esc(m.time)}</span></div><div><b>Stade</b>${esc(m.stadium)}</div><div><b>Ville</b>${esc(m.city)}</div><div><b>Diffusion FR</b>${esc(m.tv)} ${m.tv.includes('M6')?'<br><span class="free-badge">gratuit M6/M6+</span>':''}</div></div></article>`}).join('')||'<div class="panel empty">Aucun match trouvé avec ces filtres.</div>'}

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
      modalBody.innerHTML=`<div class="team-detail-hero"><div class="flag-hero">${flags[t]||'🏳️'}</div><div><div class="tag">${esc(group)} · Coupe du Monde 2026</div><h2>${esc(t)}</h2><p>${matches.length} match(s) intégré(s) · ${freeCount} diffusion(s) gratuite(s) M6/M6+ · ${followedTeams.has(t)?'équipe suivie':'équipe non suivie'}</p></div></div><div class="metric-grid"><div class="metric"><b>Groupe</b>${esc(group)}</div><div class="metric"><b>Prochain match</b>${next?`${dateLabel(next.date)} · ${next.time}`:'À confirmer'}</div><div class="metric"><b>Matchs gratuits</b>${freeCount}</div></div><div class="team-detail-grid"><div class="team-detail-card"><h3>📅 Calendrier de l'équipe</h3>${matches.map(m=>{const opponent=m.home===t?m.away:m.home;return `<div class="team-match-row" onclick="openDetail(${jsArg(m.id)})"><b>${m.time}</b><span>${flags[t]||'🏳️'} ${esc(t)} vs ${flags[opponent]||'🏳️'} ${esc(opponent)}<br><small>${dateLabel(m.date)} · ${esc(m.city)} · ${esc(m.tv)}</small></span>${m.tv.includes('M6')?'<span class="free-badge">M6/M6+</span>':''}</div>`}).join('')||'<div class="empty-soft">Aucun match intégré.</div>'}</div><div class="team-detail-card"><h3>🏟️ Stades joués</h3>${stadiumCities.map(city=>`<div class="team-stadium-row" onclick="openStadiumDetail('${esc(city)}')"><b>📍</b><span>${esc(stadiums[city]||city)}<br><small>${esc(city)} · ${esc(venueMeta[city]?.country||'')}</small></span><span class="tag">Voir</span></div>`).join('')||'<div class="empty-soft">Aucun stade intégré.</div>'}<h3 style="margin-top:18px">🧭 Parcours</h3><div class="team-path"><div>Phase de groupes<span>${esc(group)}</span></div><div>16es de finale<span>Selon classement du groupe</span></div><div>Phase finale<span>À suivre pendant la compétition</span></div></div></div></div><div class="team-actions"><button onclick="toggleTeam('${esc(t)}');openTeamDetail('${esc(t)}')">${followedTeams.has(t)?'Ne plus suivre':'Suivre cette équipe'}</button><button onclick="q.value='${esc(t)}';switchTab('matches')">Voir ses matchs</button><button onclick="shareApp()">Partager le guide</button></div>`;
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
    let bracketActiveRound = '16es de finale';
    const _prevScores = {}; // stocke les scores précédents pour détecter les buts
    function checkGoalAnimation(){
      data.filter(m=>matchStatusKey(m)==='live').forEach(m=>{
        const key=String(m.id);
        const prev=_prevScores[key];
        const curr={a:m.score_a,b:m.score_b};
        if(prev && (curr.a!==prev.a || curr.b!==prev.b)){
          // 1) Fiche détail ouverte sur ce match précis
          if(currentOpenMatchId===key){
            const el=document.querySelector('.det-score');
            if(el){
              el.classList.add('det-score-goal');
              el.innerHTML='<span class="det-goal-text">BUT !</span>';
              setTimeout(()=>{
                el.innerHTML=curr.a+' <span class="det-sep">-</span> '+curr.b;
                el.classList.remove('det-score-goal');
              },2500);
            }
          }
          // 2) Bloc featured home, uniquement si c'est bien ce match qui y est affiché
          const featEl=document.getElementById('featuredBox');
          if(featEl && featEl.querySelector('.hm-teams')?.getAttribute('onclick')?.includes("'"+key+"'")){
            const scoreEl=featEl.querySelector('.hm-score');
            if(scoreEl){
              scoreEl.classList.add('hm-score-goal');
              setTimeout(()=>scoreEl.classList.remove('hm-score-goal'),2500);
            }
          }
          // 3) Live Center : carte focus si c'est ce match qui est en focus
          if(typeof liveCenterFocusId!=='undefined' && liveCenterFocusId===key){
            const lcEl=document.querySelector('.lc-focus-score');
            if(lcEl){
              lcEl.classList.add('lc-focus-score-goal');
              const oldHtml=lcEl.innerHTML;
              lcEl.innerHTML='<span class="det-goal-text">BUT !</span>';
              setTimeout(()=>{
                lcEl.innerHTML=curr.a+' <span class="lc-focus-sep">-</span> '+curr.b;
                lcEl.classList.remove('lc-focus-score-goal');
              },2500);
            }
          }
          // 4) Mini-card Live Center correspondant à ce match (toujours visible même hors focus)
          document.querySelectorAll('.lc-mini').forEach(btn=>{
            if(btn.getAttribute('onclick')?.includes("'"+key+"'")){
              btn.classList.add('lc-mini-goal');
              setTimeout(()=>btn.classList.remove('lc-mini-goal'),2500);
            }
          });
        }
        _prevScores[key]=curr;
      });
    }
    function renderBracket(){
      if(!window.bracketBox) return;
      const rounds = [
        {key:'16es de finale',   label:'16es de finale'},
        {key:'8es de finale',    label:'8es de finale'},
        {key:'Quarts de finale', label:'Quarts de finale'},
        {key:'Demi-finales',     label:'Demi-finales'},
        {key:'Finale',           label:'Finale'}
      ];

      function isSlot(name){
        if(!name) return true;
        const s = String(name);
        return s.startsWith('Vainqueur') || s.startsWith('Perdant') || s.toLowerCase().includes('demi-finale');
      }

      function teamCell(name, isWinner, isDone, scored){
        if(isSlot(name)){
          return '<div class="bk-team bk-tbd"><span class="bk-flag">⏳</span><span class="bk-name bk-name-tbd">À déterminer</span></div>';
        }
        const flag = flags[name] || '🏳️';
        const cls = isWinner ? 'bk-name bk-winner' : (isDone && scored ? 'bk-name bk-loser' : 'bk-name');
        return '<div class="bk-team"><span class="bk-flag">'+flag+'</span><span class="'+cls+'">'+esc(name)+'</span></div>';
      }

      function matchCard(m){
        const k = matchStatusKey(m);
        const isLive = k === 'live';
        const isDone = k === 'finished';
        const scored = m.score_a !== null && m.score_a !== undefined && m.score_b !== null && m.score_b !== undefined;
        const freeTV = m.tv && m.tv.includes('M6');
        const wH = isDone && m.winner ? (m.winner===m.home) : (isDone && scored && Number(m.score_a) > Number(m.score_b));
        const wA = isDone && m.winner ? (m.winner===m.away) : (isDone && scored && Number(m.score_b) > Number(m.score_a));
        const cardClass = 'bk-card' + (isLive?' bk-live':'') + (isDone?' bk-done':'');
        const statusBadge = isLive
          ? '<span class="bk-badge bk-badge-live">● EN DIRECT</span>'
          : isDone ? '<span class="bk-badge bk-badge-done">✓ Terminé</span>' : '';
        const freeBadge = freeTV ? '<span class="bk-badge bk-badge-free">M6/M6+</span>' : '';
        const scoreHtml = scored
          ? '<div class="bk-score'+(isLive?' bk-score-live':'')+'">'+m.score_a+' - '+m.score_b+'</div>'+(m.pen_a!=null&&m.pen_b!=null?'<div class="bk-pen">tab '+m.pen_a+'-'+m.pen_b+'</div>':'')
          : '<div class="bk-vs">VS</div>';
        return '<div class="'+cardClass+'" onclick="openDetail('+jsArg(m.id)+')">'
          +'<div class="bk-top">'+statusBadge+'<span class="bk-date">'+dateLabel(m.date)+' · '+m.time+'</span>'+freeBadge+'</div>'
          +'<div class="bk-matchup">'
          +'<div class="bk-left">'+teamCell(m.home, wH, isDone, scored)+'</div>'
          +scoreHtml
          +'<div class="bk-right">'+teamCell(m.away, wA, isDone, scored)+'</div>'
          +'</div>'
          +'<div class="bk-meta">🏟️ '+esc(m.stadium)+' · 📍 '+esc(m.city)+'</div>'
          +'</div>';
      }

      // Onglets horizontaux
      const tabsHtml = '<div class="bk-tabs">'
        + rounds.map(function(r){
          const isActive = r.key === bracketActiveRound;
          const all = data.filter(function(m){ return m.phase === r.key; });
          const done = all.filter(function(m){ return matchStatusKey(m) === 'finished'; }).length;
          const badge = (all.length && done) ? ' <span class="bk-tab-badge">'+done+'/'+all.length+'</span>' : '';
          return '<button class="bk-tab'+(isActive?' bk-tab-active':'')+'" onclick="setBracketRound(\''+r.key+'\')">'
            +r.label+badge+'</button>';
        }).join('')
        +'</div>';

      const activeMatches = data.filter(function(m){ return m.phase === bracketActiveRound; })
        .sort(function(a,b){ return matchStart(a)-matchStart(b); });

      const bodyHtml = activeMatches.length
        ? '<div class="bk-grid">'+activeMatches.map(matchCard).join('')+'</div>'
        : '<div class="bk-empty">Les matchs de ce tour apparaîtront ici au fil de la compétition.</div>';

      bracketBox.innerHTML = tabsHtml + bodyHtml;
    }
    function setBracketRound(r){ bracketActiveRound=r; renderBracket(); }

    const quizFallback=[{id:'local-1',question:'Combien de pays accueillent la Coupe du Monde 2026 ?',correct_answer:'3',options:['2','3','4','5']},{id:'local-2',question:'Quel stade accueille la finale intégrée dans ce guide ?',correct_answer:'MetLife Stadium',options:['SoFi Stadium','MetLife Stadium','AT&T Stadium','Estadio Azteca']},{id:'local-3',question:'Quel pays hôte joue le match d\u2019ouverture ?',correct_answer:'Mexique',options:['Canada','Mexique','États-Unis','Brésil']}];
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
    // (Ancien système de sondage 3-boutons remplacé par le pronostic score-exact
    // — voir renderChallengeMatch() dans 40-predictions-v2.js)


    // ─── Fan Zone : quiz et pronos avec gating compte ─────────────────────
    function renderLockedOverlay(label) {
      return `<div onclick="openAuthModal()" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#06142299;backdrop-filter:blur(4px);border-radius:18px;border:1px solid #ffffff14;cursor:pointer">
        <div style="text-align:center;padding:20px">
          <div style="font-size:32px;margin-bottom:10px">🔒</div>
          <div style="color:#dcecff;font-weight:900;font-size:15px;margin-bottom:14px;line-height:1.4">${label}</div>
          <button onclick="event.stopPropagation();openAuthModal()" style="background:linear-gradient(90deg,#ffd166,#ff9f43);color:#061426;-webkit-text-fill-color:#061426;border:none;border-radius:14px;padding:12px 18px;font-weight:950;font-size:14px;cursor:pointer;font-family:inherit">Créer mon compte →</button>
        </div>
      </div>`;
    }

    // (renderPollMatch supprimé — remplacé par renderChallengeMatch dans 40-predictions-v2.js)


    function renderFanZone(){
      if(!window.quizBox) return;
      const isLoggedIn = typeof currentUser !== 'undefined' && currentUser !== null;

      // ── QUIZ ──────────────────────────────────────────────────────────────
      const item=getDailyQuiz();
      if(!isLoggedIn){
        quizBox.innerHTML=`<div style="position:relative;border-radius:18px;overflow:hidden"><div style="filter:blur(4px);pointer-events:none;user-select:none;opacity:.65">${item?`<b>${esc(item.question)}</b><div style="display:grid;gap:8px;margin-top:10px">${(item.options||[]).slice(0,4).map(o=>`<div style="background:#ffffff10;border:1px solid #ffffff18;border-radius:14px;padding:10px 14px;color:#adc0d2;font-size:14px">${esc(o)}</div>`).join('')}</div>`:'<div class="empty-soft">Quiz du jour</div>'}</div>${renderLockedOverlay('Connecte-toi pour jouer au quiz et gagner des points')}</div>`;
      } else if(item){
        const quizKey=`wc26_quiz_${localDateKey()}_${item.id}`;
        const answered=localStorage.getItem(quizKey);
        const options=(item.options||[]).filter(Boolean);
        const sourceLabel=quizLoaded?'Question du jour':'Question locale';
        quizBox.innerHTML=`<div class="mini" style="margin-bottom:8px;color:#adc0d2">${sourceLabel}</div><b>${esc(item.question)}</b>`+options.map(o=>`<button class="quiz-option ${answered?(o===item.correct_answer?'good':(o===answered?'bad':'')):''}\" ${answered?'disabled':''} onclick="answerQuiz('${esc(quizKey)}','${esc(o)}')"><span>${esc(o)}</span>${answered&&o===item.correct_answer?'✅':''}</button>`).join('')+(answered?'<div class="mini" style="margin-top:8px;color:#ffd166">Nouveau quiz demain.</div>':'');
      } else {
        quizBox.innerHTML='<div class="empty-soft">Quiz indisponible pour le moment.</div>';
      }

      // ── PRONOSTICS : 3 prochains matchs uniquement ────────────────────────
      const now=new Date();
      let pollMatches=data.filter(m=>!isPast(m)&&matchStatusKey(m)!=='finished').sort((a,b)=>matchStart(a)-matchStart(b)).slice(0,3);
      let pollTitle=pollMatches.some(m=>sameDay(matchStart(m),now))?'Pronostics du jour':'Prochains pronostics';

      if(!isLoggedIn){
        pollBox.innerHTML=`<h3 style="margin:0 0 10px">🔥 ${pollTitle}</h3><div style="position:relative;border-radius:18px;overflow:hidden"><div style="filter:blur(4px);pointer-events:none;user-select:none;opacity:.65">${pollMatches.slice(0,2).map(m=>`<div class="poll-match-card" style="opacity:.5;pointer-events:none"><b>${flags[m.home]||'🏳️'} ${esc(m.home)} vs ${flags[m.away]||'🏳️'} ${esc(m.away)}</b><div class="mini">${dateLabel(m.date)} · ${m.time}</div><div style="display:grid;gap:6px;margin-top:8px">${['─','─','─'].map(o=>`<div style="background:#ffffff10;border:1px solid #ffffff18;border-radius:12px;padding:8px 12px;color:#adc0d2">${o}</div>`).join('')}</div></div>`).join('')}</div>${renderLockedOverlay('Connecte-toi pour pronostiquer et grimper dans le classement')}</div><button onclick="switchTab('matches');setTimeout(()=>{const next=data.filter(m=>!isPast(m)).sort((a,b)=>matchStart(a)-matchStart(b))[0];if(next){const el=document.getElementById('match-'+next.id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}},200)" style="display:block;width:100%;margin-top:12px;background:#ffffff0d;border:1px solid #ffffff18;color:#dcecff;-webkit-text-fill-color:#dcecff;border-radius:14px;padding:12px;font-weight:900;cursor:pointer;font-family:inherit">Voir tous les matchs →</button>`;
      } else {
        pollBox.innerHTML=`<h3 style="margin:0 0 10px">🔥 ${pollTitle}</h3><p class="mini">Synchronisé entre tous les joueurs.</p>${pollMatches.length?pollMatches.map(renderChallengeMatch).join(''):'<div class="empty-soft">Aucun match à pronostiquer.</div>'}<button onclick="switchTab('matches');setTimeout(()=>{const next=data.filter(m=>!isPast(m)).sort((a,b)=>matchStart(a)-matchStart(b))[0];if(next){const el=document.getElementById('match-'+next.id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}},200)" style="display:block;width:100%;margin-top:12px;background:#ffffff0d;border:1px solid #ffffff18;color:#dcecff;-webkit-text-fill-color:#dcecff;border-radius:14px;padding:12px;font-weight:900;cursor:pointer;font-family:inherit">Voir tous les matchs →</button>`;
      }

      // ── STATS ─────────────────────────────────────────────────────────────
      if(window.fanStatsBox){
        const todayMatches=data.filter(m=>sameDay(matchStart(m),now));
        const baseMatches=todayMatches.length?todayMatches:pollMatches;
        const freeCount=baseMatches.filter(m=>String(m.tv||'').includes('M6')).length;
        const totalVotes=(predictionRows||[]).length;
        const quizStatus=item?'Question prête':'Quiz indisponible';
        fanStatsBox.innerHTML=`<div class="metric-grid" style="grid-template-columns:1fr 1fr;margin:0 0 12px"><div class="metric"><b>Matchs affichés</b>${baseMatches.length}</div><div class="metric"><b>Diffusions gratuites</b>${freeCount}</div><div class="metric"><b>Votes enregistrés</b>${totalVotes}</div><div class="metric"><b>Quiz du jour</b>${quizStatus}</div></div>`;
      }
    }

    async function answerQuiz(quizKey, ans) {
      // Sauvegarde locale immédiate
      localStorage.setItem(quizKey, ans);
      renderFanZone();

      // Si connecté → enregistre dans Supabase et attribue les points
      if(typeof currentUser === 'undefined' || !currentUser) return;

      try {
        const item = getDailyQuiz();
        if(!item) return;
        const isCorrect = ans === item.correct_answer;
        const pointsEarned = isCorrect ? 2 : 0;
        const questionId = quizKey; // unique par jour + question

        // Insère dans user_quiz_answers avec token auth (ignore si déjà répondu)
        await authFetch('user_quiz_answers', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            user_id: currentUser.id,
            question_id: questionId,
            answer: ans,
            is_correct: isCorrect,
            points_earned: pointsEarned,
          }),
        });

        // Recalcule les points du classement
        if(typeof recalculateUserPoints === 'function') {
          await recalculateUserPoints(currentUser.id);
          // Rafraîchit le bloc challenge
          if(typeof renderChallenge === 'function') {
            if(typeof loadLeaderboard === 'function') await loadLeaderboard();
            renderChallenge();
          }
        }
      } catch(err) {
        // Erreur silencieuse (doublon ou indisponible) — la réponse locale est déjà sauvegardée
        console.warn('Quiz Supabase:', err.message || err);
      }
    }
    // (votePoll supprimé — remplacé par submitScorePredictionCompact dans 40-predictions-v2.js)


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
      modalBody.innerHTML=`<div class="tag">Ville hôte · ${esc(v.country||'')}</div><div class="detail-title">🏟️ ${esc(stadiums[city]||city)}</div><div class="venue-grid"><div class="venue-photo" data-label="${esc(stadiums[city]||'Stade')} — ${esc(city)}"><img src="${img}" alt="${esc(stadiums[city]||'Stade')}" loading="lazy" onerror="stadiumImageFallback(this,'${esc(city)}',0)"></div><div class="map-card"><div class="host-map-title"><b>Où se trouve la ville ?</b><span>Carte interactive</span></div><p class="small">Survole les autres points ou clique pour changer de stade.</p>${renderHostMap(city)}</div></div><div class="metric-grid"><div class="metric"><b>Ville</b>${esc(city)}</div><div class="metric"><b>Pays</b>${esc(v.country||'')}</div><div class="metric"><b>Capacité officielle FIFA</b>${esc(v.capacity||'À confirmer')}</div><div class="metric"><b>Fuseau local</b>${esc(v.timezone||'À confirmer')}</div><div class="metric"><b>Matchs intégrés</b>${matches.length}</div><div class="metric"><b>Stade</b>${esc(stadiums[city]||'')}</div></div><h3 class="section-title" style="margin-top:18px">Matchs dans ce stade</h3><div class="stadium-detail-list">${matches.map(m=>`<div class="mini-match" onclick="openDetail(${jsArg(m.id)})"><div><div class="mini-teams">${m.time} · ${flags[m.home]||'🏳️'} ${esc(m.home)} - ${flags[m.away]||'🏳️'} ${esc(m.away)}</div><div class="small">${dateLabel(m.date)} · ${esc(m.phase)} · ${esc(m.tv)}</div></div>${m.tv.includes('M6')?'<span class="free-badge">M6/M6+</span>':''}</div>`).join('')||'<div class="empty-soft">Aucun match intégré pour ce stade.</div>'}</div><div class="actions"><button onclick="showStadiumMatches('${esc(city)}')">Voir dans tous les matchs</button><button onclick="shareApp()">Partager l'app</button></div>`;
      openModal()
    }
    function showStadiumMatches(city){closeModal();q.value=city;activeTab='matches';renderAll();setTimeout(()=>list.scrollIntoView({behavior:'smooth'}),80)}

    function openRandomStadium(){
      const cities=Object.keys(venueMeta||{});
      if(!cities.length) return switchTab('stadiums');
      const city=cities[Math.floor(Math.random()*cities.length)];
      openStadiumDetail(city);
    }

    let currentOpenMatchId=null;
    
    // Rafraîchit le contenu de la modale ouverte (score/minute/buteurs) en préservant le scroll
    function refreshOpenModal(){
      if(!currentOpenMatchId || !modal.classList.contains('open')) return;
      const m = data.find(x=>String(x.id)===String(currentOpenMatchId));
      if(!m) return;
      const scrollPos = modalBody.scrollTop;
      openDetail(currentOpenMatchId);
      modalBody.scrollTop = scrollPos;
    }

    let detailActiveTab='resume';
    async function openDetail(id){
      currentOpenMatchId=String(id);
      detailActiveTab='resume';
      modal.querySelector('.modal-card').classList.remove('stadium-modal');
      modal.querySelector('.modal-head b').textContent='Détail du match';
      const m=data.find(x=>String(x.id)===String(id));
      if(!m) return;
      const v=venueMeta[m.city]||{};
      const k=matchStatusKey(m);
      const isLive=k==='live', isDone=k==='finished';
      const scored=m.score_a!==null&&m.score_a!==undefined&&m.score_b!==null&&m.score_b!==undefined;
      const wH=isDone&&m.winner?(m.winner===m.home):(isDone&&scored&&Number(m.score_a)>Number(m.score_b));
      const wA=isDone&&m.winner?(m.winner===m.away):(isDone&&scored&&Number(m.score_b)>Number(m.score_a));
      const freeTV=m.tv&&m.tv.includes('M6');
      const showTabs=isLive||isDone;

      const events=matchEventsByMatchId[String(m.id)]||[];
      const allEvents=[...events].sort((a,b)=>Number(a.elapsed||0)-Number(b.elapsed||0));

      function eventIcon(e){
        const t=String(e.event_type||'').toLowerCase(),d=String(e.detail||'').toLowerCase();
        if(t==='goal'&&d.includes('own')) return '⚽🔴';
        if(t==='goal') return '⚽';
        if(t==='card'&&d.includes('yellow')) return '🟨';
        if(t==='card'&&d.includes('red')) return '🟥';
        if(t==='subst') return '🔄';
        return '•';
      }
      function eventDesc(e){
        const t=String(e.event_type||'').toLowerCase();
        if(t==='goal') return `${esc(e.player_name||'But')}${e.assist_name?' <span class="det-sub">(passe: '+esc(e.assist_name)+')</span>':''}`;
        if(t==='card') return `${esc(e.player_name||'')} <span class="det-sub">${esc(e.detail||'')}</span>`;
        if(t==='subst') return `↑ ${esc(e.player_name||'')} <span class="det-sub">↓ ${esc(e.assist_name||'')}</span>`;
        return esc(e.player_name||'');
      }

      const scoreHtml=scored
        ?`<div class="det-score${isLive?' det-score-live':''}">${m.score_a}<span class="det-sep"> - </span>${m.score_b}</div>` + (m.pen_a!=null&&m.pen_b!=null?'<div class="det-pen">Tirs au but : <b>'+m.pen_a+' - '+m.pen_b+'</b></div>':'')
        :`<div class="det-vs">VS</div>`;

      const stBadge=isLive
        ?`<span class="hm-live-badge">● EN DIRECT${liveLabel(m)?' · '+liveLabel(m):''}</span>`
        :isDone?`<span class="hm-done-badge">✓ Terminé</span>`
        :`<span class="hm-next-badge">⏳ ${smartDateLabel(m)} · ${esc(m.time)}</span>`;

      // Onglets (uniquement si live ou terminé)
      const tabsHtml=showTabs?`
        <div class="det-tabs">
          <button class="det-tab det-tab-active" data-tab="resume" onclick="setDetailTab('resume')">Résumé</button>
          <button class="det-tab" data-tab="stats" onclick="setDetailTab('stats')">Stats</button>
          <button class="det-tab" data-tab="lineups" onclick="setDetailTab('lineups')">Compos</button>
          <button class="det-tab" data-tab="predictions" onclick="setDetailTab('predictions')">Prédictions</button>
          <button class="det-tab" data-tab="h2h" onclick="setDetailTab('h2h')">H2H</button>
        </div>`:'';

      const resumePanel=allEvents.length?`
        <div class="det-timeline">
          ${allEvents.map(e=>{
            const isHome=e.team_name===m.home||frName(e.team_name)===m.home;
            return `<div class="det-event ${isHome?'det-event-home':'det-event-away'}">
              <div class="det-event-min">${e.elapsed?e.elapsed+"'":''}${e.extra?'+'+e.extra:''}</div>
              <div class="det-event-icon">${eventIcon(e)}</div>
              <div class="det-event-desc">${eventDesc(e)}<div class="det-event-team">${esc(e.team_name||'')}</div></div>
            </div>`;
          }).join('')}
        </div>`:`<div class="det-empty">${isLive?'Aucun événement pour le moment.':isDone?'Aucun événement enregistré.':'Le résumé sera disponible pendant le match.'}</div>`;

      const panelsHtml=showTabs?`
        <div class="det-panel" data-panel="resume">${resumePanel}</div>
        <div class="det-panel" data-panel="stats" style="display:none"><div class="det-stats-loading">Chargement des statistiques...</div></div>
        <div class="det-panel" data-panel="lineups" style="display:none"><div class="det-stats-loading">Chargement des compositions...</div></div>
        <div class="det-panel" data-panel="predictions" style="display:none"><div class="det-stats-loading">Chargement des prédictions...</div></div>
        <div class="det-panel" data-panel="h2h" style="display:none"><div class="det-stats-loading">Chargement des confrontations...</div></div>
      `:`<div class="det-section"><h3 class="det-section-title">⏳ Avant le match</h3><div id="detPredictionsPreview"><div class="det-stats-loading">Chargement des prédictions...</div></div></div>`;

      modalBody.innerHTML=`
        <div class="det-header">
          <span class="det-phase">${esc(m.phase)} · ${esc(m.round)}</span>
          ${stBadge}
        </div>
        <div class="det-teams">
          <div class="det-team ${wH?'det-winner':''}">
            <span class="det-flag">${flags[m.home]||'🏳️'}</span>
            <span class="det-name">${esc(m.home)}</span>
          </div>
          <div class="det-score-block">${scoreHtml}</div>
          <div class="det-team det-team-right ${wA?'det-winner':''}">
            <span class="det-flag">${flags[m.away]||'🏳️'}</span>
            <span class="det-name">${esc(m.away)}</span>
          </div>
        </div>
        ${tabsHtml}
        ${panelsHtml}
        <div id="predictionBox"></div>
        <div class="det-section">
          <h3 class="det-section-title">🏟️ Informations</h3>
          <div class="det-info-grid">
            <div class="det-info-item"><span class="det-info-label">📅 Date</span><span class="det-info-val">${dateLabel(m.date)}</span></div>
            <div class="det-info-item"><span class="det-info-label">⏰ Heure</span><span class="det-info-val">${esc(m.time)}</span></div>
            <div class="det-info-item"><span class="det-info-label">🏟️ Stade</span><span class="det-info-val">${esc(m.stadium)}</span></div>
            <div class="det-info-item"><span class="det-info-label">📍 Ville</span><span class="det-info-val">${esc(m.city)}</span></div>
            <div class="det-info-item"><span class="det-info-label">👥 Capacité</span><span class="det-info-val">${esc(v.capacity||'À confirmer')}</span></div>
            <div class="det-info-item"><span class="det-info-label">📺 Diffusion</span><span class="det-info-val">${esc(m.tv)}${freeTV?' <span class="hm-free">Gratuit</span>':''}</span></div>
          </div>
        </div>
        <div class="det-photo">
          <img src="${photoList(m.city)[0]||''}" alt="${esc(m.stadium)}" loading="lazy" onerror="stadiumImageFallback(this,'${esc(m.city)}',0)" style="width:100%;border-radius:16px;max-height:180px;object-fit:cover">
        </div>
        <div class="det-actions">
          <button onclick="toggleFav(${jsArg(m.id)});openDetail(${jsArg(m.id)})">${favs.has(String(m.id))?'★ Retirer des favoris':'☆ Ajouter aux favoris'}</button>
          <button onclick="shareMatch(${jsArg(m.id)})">📤 Partager</button>
          <button onclick="window.open('${`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(m.home+' vs '+m.away)}&dates=${(()=>{const d=new Date(m.date+'T'+m.time+':00+02:00');const e=new Date(d.getTime()+7200000);const f=x=>x.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';return f(d)+'/'+f(e)})()}&details=${encodeURIComponent(m.phase+' · '+m.stadium+', '+m.city)}&location=${encodeURIComponent(m.stadium+', '+m.city)}`}','_blank')">📅 Agenda</button>
        </div>
      `;

      if(!modal.classList.contains('open')) openModal();
      renderPredictionBox(m.id);

      if(m.api_fixture_id){
        if(showTabs){
          loadDetailStats(m);
          loadDetailLineups(m);
        }
        loadDetailPredictions(m, showTabs);
        loadDetailH2H(m);
      }
    }

    function setDetailTab(tab){
      detailActiveTab=tab;
      document.querySelectorAll('.det-tab').forEach(b=>b.classList.toggle('det-tab-active',b.dataset.tab===tab));
      document.querySelectorAll('.det-panel').forEach(p=>{p.style.display=p.dataset.panel===tab?'block':'none'});
    }

    // Génère le HTML des stats (cercle de possession + barres) — design unique,
    // partagé entre la fiche détail et le bloc "à la une" de l'accueil, pour que
    // tous les matchs (en cours, terminés) aient exactement le même rendu.
    function buildStatsHtml(m, stats, emptyClass){
      emptyClass = emptyClass || 'det-empty';
      if(stats.length<2) return `<div class="${emptyClass}">Statistiques non disponibles pour ce match.</div>`;
      const h=stats[0], a=stats[1];
      function getStat(team,name){const s=team.statistics||[];const found=s.find(x=>x.type===name);return found?(found.value??0):0;}
      function statBar(label,hVal,aVal){
        const hNum=parseFloat(String(hVal).replace('%',''))||0, aNum=parseFloat(String(aVal).replace('%',''))||0;
        const tot=hNum+aNum||1;
        const hPct=Math.round((hNum/tot)*100);
        return `<div class="det-stat-row">
          <span class="det-stat-val">${hVal}</span>
          <div class="det-stat-bar-wrap">
            <div class="det-stat-bar">
              <div class="det-stat-home-bar" style="flex:${hPct}"></div>
              <div class="det-stat-divider"></div>
              <div class="det-stat-away-bar" style="flex:${100-hPct}"></div>
            </div>
            <span class="det-stat-label">${label}</span>
          </div>
          <span class="det-stat-val">${aVal}</span>
        </div>`;
      }
      const possH=parseFloat(String(getStat(h,'Ball Possession')).replace('%',''))||0;
      const possA=parseFloat(String(getStat(a,'Ball Possession')).replace('%',''))||0;
      const circumference=2*Math.PI*34;
      const homeDash=Math.round((possH/100)*circumference);
      const awayDash=Math.round((possA/100)*circumference);
      return `
        <div class="det-stats-header"><span>${esc(m.home)}</span><span>${esc(m.away)}</span></div>
        <div class="det-poss-wrap">
          <div class="det-poss-circle">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff10" stroke-width="7"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff30" stroke-width="7" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference-awayDash}" stroke-linecap="round"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ffd166" stroke-width="7" stroke-dasharray="${circumference}" stroke-dashoffset="${homeDash}" stroke-linecap="round" opacity="0.9"/>
            </svg>
            <div class="det-poss-val"><span>${possH}%</span><span>poss.</span></div>
          </div>
          <div class="det-poss-labels">
            <div class="det-poss-label"><div class="det-poss-dot det-poss-dot-home"></div><span>${esc(m.home)}</span><strong>${possH}%</strong></div>
            <div class="det-poss-label"><div class="det-poss-dot det-poss-dot-away"></div><span>${esc(m.away)}</span><strong>${possA}%</strong></div>
          </div>
        </div>
        ${statBar('Tirs totaux',getStat(h,'Total Shots'),getStat(a,'Total Shots'))}
        ${statBar('Tirs cadrés',getStat(h,'Shots on Goal'),getStat(a,'Shots on Goal'))}
        ${statBar('Tirs non cadrés',getStat(h,'Shots off Goal'),getStat(a,'Shots off Goal'))}
        ${statBar('Corners',getStat(h,'Corner Kicks'),getStat(a,'Corner Kicks'))}
        ${statBar('Fautes',getStat(h,'Fouls'),getStat(a,'Fouls'))}
        ${statBar('Hors-jeux',getStat(h,'Offsides'),getStat(a,'Offsides'))}
        ${statBar('Cartons jaunes',getStat(h,'Yellow Cards'),getStat(a,'Yellow Cards'))}
        ${statBar('Cartons rouges',getStat(h,'Red Cards'),getStat(a,'Red Cards'))}
        ${statBar('Arrêts gardien',getStat(h,'Goalkeeper Saves'),getStat(a,'Goalkeeper Saves'))}
        ${statBar('Passes réussies',getStat(h,'Passes accurate'),getStat(a,'Passes accurate'))}
        ${statBar('% Passes',getStat(h,'Passes %')||'0%',getStat(a,'Passes %')||'0%')}
      `;
    }

    async function loadDetailStats(m){
      const els=document.querySelectorAll('.det-panel[data-panel="stats"]');
      const el=els[els.length-1];
      if(!el) return;
      try{
        const res=await fetch(`/api/match-stats?fixture_id=${encodeURIComponent(m.api_fixture_id)}`);
        if(!res.ok){ el.innerHTML='<div class="det-empty">Statistiques non disponibles pour ce match.</div>'; return; }
        const json=await res.json();
        const stats=json.stats||[];
        el.innerHTML=buildStatsHtml(m, stats, 'det-empty');
      }catch(e){
        el.innerHTML='<div class="det-empty">Statistiques non disponibles pour ce match.</div>';
      }
    }

    async function loadDetailLineups(m){
      const els=document.querySelectorAll('.det-panel[data-panel="lineups"]');
      const el=els[els.length-1];
      if(!el) return;
      try{
        const res=await fetch(`/api/match-lineups?fixture_id=${encodeURIComponent(m.api_fixture_id)}`);
        if(!res.ok){ el.innerHTML='<div class="det-empty">Compositions non disponibles pour ce match.</div>'; return; }
        const json=await res.json();
        const lineups=json.lineups||[];
        if(lineups.length<2){ el.innerHTML='<div class="det-empty">Compositions non disponibles pour ce match.</div>'; return; }

        const home=lineups[0], away=lineups[1];
        const homeXI=(home.startXI||[]).map(p=>p.player);
        const awayXI=(away.startXI||[]).map(p=>p.player);

        // Parse grid "ligne:colonne" -> position % sur le terrain
        // Home joue de bas en haut (lignes 1=gardien en bas), Away de haut en bas (miroir)
        function parseGrid(grid){
          if(!grid) return null;
          const [row,col]=String(grid).split(':').map(Number);
          return {row,col};
        }
        function groupByRow(xi){
          const rows={};
          xi.forEach(p=>{
            const g=parseGrid(p.grid);
            if(!g) return;
            if(!rows[g.row]) rows[g.row]=[];
            rows[g.row].push({...p,col:g.col});
          });
          return rows;
        }
        function renderTeamOnPitch(xi,isHome){
          const rows=groupByRow(xi);
          const rowKeys=Object.keys(rows).map(Number).sort((a,b)=>a-b);
          const totalRows=rowKeys.length||1;
          return rowKeys.map((rk,idx)=>{
            const players=rows[rk].sort((a,b)=>a.col-b.col);
            const colCount=players.length||1;
            // Position verticale : home en bas (100%->50%), away en haut (50%->0%)
            const vertPct=isHome
              ? 95 - (idx/(totalRows-1||1))*38
              : 5 + (idx/(totalRows-1||1))*38;
            return players.map((p,ci)=>{
              const horizPct=((ci+1)/(colCount+1))*100;
              return `<div class="pitch-player ${isHome?'pitch-home':'pitch-away'}" style="left:${horizPct}%;top:${vertPct}%">
                <div class="pitch-player-dot">${p.number??''}</div>
                <div class="pitch-player-name">${esc((p.name||'').split(' ').pop())}</div>
              </div>`;
            }).join('');
          }).join('');
        }

        function subsList(t){
          const subs=(t.substitutes||[]).map(p=>p.player);
          if(!subs.length) return '';
          return `<div class="det-subs-title">Remplaçants — ${esc(t.team?.name||'')}</div><div class="det-lineup-list">${subs.map(p=>`<div class="det-player det-player-sub"><span class="det-player-num">${p.number??''}</span><span>${esc(p.name||'')}</span></div>`).join('')}</div>`;
        }

        el.innerHTML=`
          <div class="pitch-header">
            <div class="pitch-team-info"><b>${esc(home.team?.name||'')}</b><span>${esc(home.formation||'')}${home.coach?.name?' · '+esc(home.coach.name):''}</span></div>
            <div class="pitch-team-info pitch-team-info-right"><b>${esc(away.team?.name||'')}</b><span>${esc(away.formation||'')}${away.coach?.name?' · '+esc(away.coach.name):''}</span></div>
          </div>
          <div class="pitch-wrap">
            <div class="pitch">
              <div class="pitch-halfway"></div>
              <div class="pitch-circle"></div>
              ${renderTeamOnPitch(homeXI,true)}
              ${renderTeamOnPitch(awayXI,false)}
            </div>
          </div>
          <div class="det-lineups-subs-grid">
            ${subsList(home)}
            ${subsList(away)}
          </div>
        `;
      }catch(e){
        el.innerHTML='<div class="det-empty">Compositions non disponibles pour ce match.</div>';
      }
    }

    async function loadDetailPredictions(m, showTabs){
      const selector=showTabs?'.det-panel[data-panel="predictions"]':'#detPredictionsPreview';
      const els=document.querySelectorAll(selector);
      const el=els[els.length-1];
      if(!el) return;
      try{
        const res=await fetch(`/api/match-predictions?fixture_id=${encodeURIComponent(m.api_fixture_id)}`);
        if(!res.ok){ el.innerHTML='<div class="det-empty">Prédictions non disponibles pour ce match.</div>'; return; }
        const json=await res.json();
        const pred=(json.predictions||[])[0];
        if(!pred){ el.innerHTML='<div class="det-empty">Prédictions non disponibles pour ce match.</div>'; return; }
        const p=pred.predictions||{};
        const pct=p.percent||{};
        const homePct=parseInt(pct.home)||0, drawPct=parseInt(pct.draw)||0, awayPct=parseInt(pct.away)||0;
        const advice=p.advice||'';
        const winnerName=p.winner?.name||'';
        const comp=pred.comparison||{};
        function compRow(label,key){
          const h=parseInt(comp[key]?.home)||0, a=parseInt(comp[key]?.away)||0;
          return `<div class="det-stat-row">
            <span class="det-stat-val">${h}%</span>
            <div class="det-stat-bar-wrap">
              <div class="det-stat-bar"><div class="det-stat-fill det-stat-home" style="width:${h}%"></div></div>
              <span class="det-stat-label">${label}</span>
              <div class="det-stat-bar"><div class="det-stat-fill det-stat-away" style="width:${a}%"></div></div>
            </div>
            <span class="det-stat-val">${a}%</span>
          </div>`;
        }
        el.innerHTML=`
          <div class="det-pred-probs">
            <div class="det-pred-prob"><span class="det-pred-prob-label">${esc(m.home)}</span><div class="det-pred-prob-bar"><div style="width:${homePct}%;background:#ffd166"></div></div><span class="det-pred-prob-val">${homePct}%</span></div>
            <div class="det-pred-prob"><span class="det-pred-prob-label">Nul</span><div class="det-pred-prob-bar"><div style="width:${drawPct}%;background:#8fa6bd"></div></div><span class="det-pred-prob-val">${drawPct}%</span></div>
            <div class="det-pred-prob"><span class="det-pred-prob-label">${esc(m.away)}</span><div class="det-pred-prob-bar"><div style="width:${awayPct}%;background:#ef3340"></div></div><span class="det-pred-prob-val">${awayPct}%</span></div>
          </div>
          ${winnerName?`<div class="det-pred-winner">🔮 Vainqueur prédit : <b>${esc(frName(winnerName))}</b></div>`:''}
          ${advice?`<div class="det-pred-advice">${esc(advice)}</div>`:''}
          ${comp.att?`<div class="det-pred-comp-title">Comparaison des forces</div>${compRow('Attaque','att')}${compRow('Défense','def')}${compRow('Forme','form')}${compRow('Total H2H','h2h')}`:''}
        `;
      }catch(e){
        el.innerHTML='<div class="det-empty">Prédictions non disponibles pour ce match.</div>';
      }
    }

    async function loadDetailH2H(m){
      const els=document.querySelectorAll('.det-panel[data-panel="h2h"]');
      const el=els[els.length-1];
      if(!el) return;
      try{
        const res=await fetch(`/api/match-h2h?fixture_id=${encodeURIComponent(m.api_fixture_id)}`);
        if(!res.ok){ el.innerHTML='<div class="det-empty">Confrontations non disponibles.</div>'; return; }
        const json=await res.json();
        const h2h=json.h2h||[];
        if(!h2h.length){ el.innerHTML='<div class="det-empty">Aucune confrontation historique connue.</div>'; return; }
        el.innerHTML=`<div class="det-h2h-list">${h2h.slice(0,8).map(fx=>{
          const home=frName(fx.teams?.home?.name||''), away=frName(fx.teams?.away?.name||'');
          const hg=fx.goals?.home, ag=fx.goals?.away;
          const date=fx.fixture?.date?new Date(fx.fixture.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'';
          return `<div class="det-h2h-row">
            <span class="det-h2h-date">${date}</span>
            <span class="det-h2h-match">${esc(home)} <b>${hg??'-'} - ${ag??'-'}</b> ${esc(away)}</span>
          </div>`;
        }).join('')}</div>`;
      }catch(e){
        el.innerHTML='<div class="det-empty">Confrontations non disponibles.</div>';
      }
    }

    function closeModal(){currentOpenMatchId=null;modal.classList.remove('open');unlockModalScroll();modal.querySelector('.modal-card').classList.remove('stadium-modal');modal.querySelector('.modal-head b').textContent='Détail du match'; const mb=document.getElementById('modalBody'); if(mb) mb.scrollTop=0;}
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

    // ── Featured box : gestion onglets + chargement stats/lineups ──
    function setFeaturedTab(tab){
      document.querySelectorAll('.hm-fz-tab').forEach(b=>b.classList.toggle('hm-fz-tab-active',b.dataset.tab===tab));
      document.querySelectorAll('.hm-fz-panel').forEach(p=>{p.style.display=p.dataset.panel===tab?'block':'none'});
    }

    async function loadFeaturedStats(m){
      const el=document.getElementById('hmStatsPanel');
      if(!el) return;
      try{
        const res=await fetch(`/api/match-stats?fixture_id=${encodeURIComponent(m.api_fixture_id)}`);
        if(!res.ok){ el.innerHTML='<div class="hm-fz-empty">Statistiques non disponibles pour ce match.</div>'; return; }
        const json=await res.json();
        const stats=json.stats||[];
        el.innerHTML=buildStatsHtml(m, stats, 'hm-fz-empty');
      }catch(e){
        el.innerHTML='<div class="hm-fz-empty">Statistiques non disponibles pour ce match.</div>';
      }
    }

    async function loadFeaturedLineups(m){
      const el=document.getElementById('hmLineupsPanel');
      if(!el) return;
      try{
        const res=await fetch(`/api/match-lineups?fixture_id=${encodeURIComponent(m.api_fixture_id)}`);
        if(!res.ok){ el.innerHTML='<div class="hm-fz-empty">Compositions non disponibles pour ce match.</div>'; return; }
        const json=await res.json();
        const lineups=json.lineups||[];
        if(lineups.length<2){ el.innerHTML='<div class="hm-fz-empty">Compositions non disponibles pour ce match.</div>'; return; }

        const home=lineups[0], away=lineups[1];
        const homeXI=(home.startXI||[]).map(p=>p.player);
        const awayXI=(away.startXI||[]).map(p=>p.player);

        function parseGrid(grid){
          if(!grid) return null;
          const [row,col]=String(grid).split(':').map(Number);
          return {row,col};
        }
        function groupByRow(xi){
          const rows={};
          xi.forEach(p=>{
            const g=parseGrid(p.grid);
            if(!g) return;
            if(!rows[g.row]) rows[g.row]=[];
            rows[g.row].push({...p,col:g.col});
          });
          return rows;
        }
        function renderTeamOnPitch(xi,isHome){
          const rows=groupByRow(xi);
          const rowKeys=Object.keys(rows).map(Number).sort((a,b)=>a-b);
          const totalRows=rowKeys.length||1;
          return rowKeys.map((rk,idx)=>{
            const players=rows[rk].sort((a,b)=>a.col-b.col);
            const colCount=players.length||1;
            const vertPct=isHome ? 95 - (idx/(totalRows-1||1))*38 : 5 + (idx/(totalRows-1||1))*38;
            return players.map((p,ci)=>{
              const horizPct=((ci+1)/(colCount+1))*100;
              return `<div class="pitch-player ${isHome?'pitch-home':'pitch-away'}" style="left:${horizPct}%;top:${vertPct}%">
                <div class="pitch-player-dot">${p.number??''}</div>
                <div class="pitch-player-name">${esc((p.name||'').split(' ').pop())}</div>
              </div>`;
            }).join('');
          }).join('');
        }

        el.innerHTML=`
          <div class="pitch-header">
            <div class="pitch-team-info"><b>${esc(home.team?.name||'')}</b><span>${esc(home.formation||'')}</span></div>
            <div class="pitch-team-info pitch-team-info-right"><b>${esc(away.team?.name||'')}</b><span>${esc(away.formation||'')}</span></div>
          </div>
          <div class="pitch-wrap">
            <div class="pitch">
              <div class="pitch-halfway"></div>
              <div class="pitch-circle"></div>
              ${renderTeamOnPitch(homeXI,true)}
              ${renderTeamOnPitch(awayXI,false)}
            </div>
          </div>
        `;
      }catch(e){
        el.innerHTML='<div class="hm-fz-empty">Compositions non disponibles pour ce match.</div>';
      }
    }

    // ── LIVE CENTER ──────────────────────────────────────────────
    let liveCenterFocusId=null; // id du match affiché en grand
    function renderLiveCenter(){
      const box=document.getElementById('liveCenterBox');
      if(!box) return;
      const liveMatches=data.filter(m=>matchStatusKey(m)==='live').sort((a,b)=>matchStart(a)-matchStart(b));
      const count=liveMatches.length;

      // Met à jour les badges nav (desktop + mobile + tab grid)
      [['liveNavBadge',' '+count],['liveNavBadgeMobile',count],['liveTabBadge',count]].forEach(([id,label])=>{
        const el=document.getElementById(id);
        if(!el) return;
        if(count>0){ el.style.display='inline-flex'; el.innerHTML='●'+label; }
        else { el.style.display='none'; }
      });

      if(!count){
        // Aucun match en direct : afficher le prochain avec compte à rebours
        const upcoming=data.filter(m=>matchStatusKey(m)==='upcoming').sort((a,b)=>matchStart(a)-matchStart(b))[0];
        if(!upcoming){
          box.innerHTML=`<div class="lc-empty"><div class="lc-empty-icon">⚽</div><h2>Aucun match en direct</h2><p>Reviens plus tard pour suivre les matchs en temps réel.</p></div>`;
          return;
        }
        const target=matchStart(upcoming).getTime();
        box.innerHTML=`
          <div class="lc-empty">
            <div class="lc-empty-icon">⏳</div>
            <h2>Aucun match en direct actuellement</h2>
            <p>Prochain coup d'envoi :</p>
            <div class="lc-next-match" onclick="openDetail(${jsArg(upcoming.id)})">
              <div class="lc-next-teams">
                <span class="lc-next-team">${flags[upcoming.home]||'🏳️'} ${esc(upcoming.home)}</span>
                <span class="lc-next-vs">vs</span>
                <span class="lc-next-team">${esc(upcoming.away)} ${flags[upcoming.away]||'🏳️'}</span>
              </div>
              <div class="lc-countdown" id="lcCountdown" data-target="${target}">--:--:--</div>
              <div class="lc-next-meta">${smartDateLabel(upcoming)} · ${esc(upcoming.time)} · ${esc(upcoming.stadium)}</div>
            </div>
          </div>`;
        startLiveCountdown();
        return;
      }

      // Focus = match sélectionné, sinon le premier live
      if(!liveCenterFocusId || !liveMatches.find(m=>String(m.id)===liveCenterFocusId)){
        liveCenterFocusId=String(liveMatches[0].id);
      }
      const focusMatch=liveMatches.find(m=>String(m.id)===liveCenterFocusId);

      function miniCard(m){
        const isFocus=String(m.id)===liveCenterFocusId;
        const scored=m.score_a!==null&&m.score_a!==undefined;
        return `<button class="lc-mini ${isFocus?'lc-mini-active':''}" onclick="setLiveFocus(${jsArg(m.id)})">
          <div class="lc-mini-top"><span class="lc-mini-live">● ${liveLabel(m)||'LIVE'}</span></div>
          <div class="lc-mini-teams">
            <span class="lc-mini-team">${flags[m.home]||'🏳️'} ${esc(m.home)}</span>
            <span class="lc-mini-score">${scored?m.score_a+'-'+m.score_b:'vs'}</span>
            <span class="lc-mini-team">${esc(m.away)} ${flags[m.away]||'🏳️'}</span>
          </div>
        </button>`;
      }

      const miniListHtml=count>1?`
        <div class="lc-mini-list">
          <div class="lc-mini-list-title">Autres matchs en direct (${count})</div>
          <div class="lc-mini-grid">${liveMatches.map(miniCard).join('')}</div>
        </div>`:'';

      box.innerHTML=`
        <div class="lc-header">
          <h2 class="lc-title">🔴 Live Center</h2>
          <p class="lc-sub">${count} match${count>1?'s':''} en direct actuellement</p>
        </div>
        <div id="lcFocusCard"></div>
        ${miniListHtml}
      `;

      renderLiveFocusCard(focusMatch);
    }

    function setLiveFocus(id){
      liveCenterFocusId=String(id);
      renderLiveCenter();
    }

    function renderLiveFocusCard(m){
      const el=document.getElementById('lcFocusCard');
      if(!el||!m) return;
      const scored=m.score_a!==null&&m.score_a!==undefined&&m.score_b!==null&&m.score_b!==undefined;
      const events=matchEventsByMatchId[String(m.id)]||[];
      const goals=events.filter(e=>{
        const t=String(e.event_type||'').toLowerCase(),d=String(e.detail||'').toLowerCase();
        return !d.includes('missed')&&(t==='goal'||d.includes('goal')||d.includes('penalty'));
      });
      const homeGoals=goals.filter(e=>e.team_name===m.home||frName(e.team_name)===m.home);
      const awayGoals=goals.filter(e=>e.team_name===m.away||frName(e.team_name)===m.away);
      const scorerLine=(goals)=>goals.length
        ?`<div class="lc-scorers">${goals.map(e=>`<span>⚽ ${e.elapsed?e.elapsed+"'":''} ${esc(e.player_name||'')}</span>`).join('')}</div>`:'';
      const pct=m.minute?Math.min(100,Math.round((Number(m.minute)/90)*100)):0;

      el.innerHTML=`
        <div class="lc-focus-card">
          <div class="lc-focus-top">
            <span class="lc-focus-phase">${esc(m.phase)}</span>
            <span class="hm-live-badge">● EN DIRECT${liveLabel(m)?' · '+liveLabel(m):''}</span>
          </div>
          <div class="lc-focus-teams" onclick="openDetail(${jsArg(m.id)})">
            <div class="lc-focus-team">
              <span class="lc-focus-flag">${flags[m.home]||'🏳️'}</span>
              <span class="lc-focus-name">${esc(m.home)}</span>
              ${scorerLine(homeGoals)}
            </div>
            <div class="lc-focus-score">${scored?m.score_a+' <span class="lc-focus-sep">-</span> '+m.score_b:'VS'}</div>
            <div class="lc-focus-team lc-focus-team-right">
              <span class="lc-focus-name">${esc(m.away)}</span>
              <span class="lc-focus-flag">${flags[m.away]||'🏳️'}</span>
              ${scorerLine(awayGoals)}
            </div>
          </div>
          <div class="hm-progress"><div class="hm-progress-bar hm-progress-live" style="width:${pct}%"></div></div>
          <div class="lc-focus-meta">
            <span>🏟️ ${esc(m.stadium)}</span>
            <span>📍 ${esc(m.city)}</span>
            <span>📺 ${esc(m.tv)}</span>
          </div>
          <button class="home-btn home-btn-primary" onclick="openDetail(${jsArg(m.id)})">Voir stats, compositions & plus →</button>
        </div>`;
    }

    let liveCountdownInterval=null;
    function startLiveCountdown(){
      if(liveCountdownInterval) clearInterval(liveCountdownInterval);
      function tick(){
        const el=document.getElementById('lcCountdown');
        if(!el) { clearInterval(liveCountdownInterval); return; }
        const target=Number(el.dataset.target);
        const diff=target-Date.now();
        if(diff<=0){ el.textContent='Coup d\'envoi !'; renderLiveCenter(); return; }
        const h=Math.floor(diff/3600000), mn=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
        el.textContent=String(h).padStart(2,'0')+':'+String(mn).padStart(2,'0')+':'+String(s).padStart(2,'0');
      }
      tick();
      liveCountdownInterval=setInterval(tick,1000);
    }

    // Affiche "Mi-temps" / "Prolongation" / minute selon le statut détaillé
    function liveLabel(m){
      if(m.period==='HT') return 'Mi-temps';
      if(m.period==='ET') return 'Prolongation'+(m.minute?' · '+esc(m.minute)+"'":'');
      if(m.period==='PEN') return 'Tirs au but';
      if(m.period==='BT') return 'Pause prolongation';
      return m.minute?esc(m.minute)+"'":'';
    }
