// V78 — Pronostics unifiés : un seul système, lié au user_id si connecté
    const GM26_SUPABASE_URL='https://lclnnxirkuuwexxcmmho.supabase.co';
    const GM26_SUPABASE_KEY='sb_publishable_F-2bOXBmO23_FfRv5KTqXg_jP2osQM2';

    function predictionLabel(m,choice){
      if(choice==='home') return m.home;
      if(choice==='draw') return 'Match nul';
      if(choice==='away') return m.away;
      return choice;
    }

    // Vérifie si l'utilisateur courant a déjà voté pour ce match
    // Cherche d'abord par user_id (connecté), sinon par user_key (anonyme)
    function myPredictionForMatch(matchId){
      const id = String(matchId);
      // Si connecté → cherche par user_id
      if(typeof currentUser !== 'undefined' && currentUser){
        const byUser = (predictionRows||[]).find(r =>
          String(r.match_id) === id && r.user_id && r.user_id === currentUser.id
        );
        if(byUser) return byUser.choice;
      }
      // Sinon cherche par user_key anonyme
      const byKey = (predictionRows||[]).find(r =>
        String(r.match_id) === id && String(r.user_key) === String(predictionUserKey)
      );
      return byKey?.choice || '';
    }

    // Stats globales pour un match depuis predictionRows
    function predictionStatsForMatch(matchId){
      const id = String(matchId);
      const rows = (predictionRows||[]).filter(r => String(r.match_id) === id);
      const counts = {};
      rows.forEach(r => { counts[r.choice] = (counts[r.choice]||0) + 1; });
      return { counts, total: rows.length };
    }

    // Sauvegarde unifiée (sondage FanZone) — utilise le point d'écriture unique
    // upsertPrediction() de 00-core-data.js, partagé avec submitScorePrediction,
    // pour éviter tout conflit 409 quand les deux fonctionnalités touchent le même match.
    async function submitUnifiedPrediction(matchId, choice){
      const id = String(matchId);

      // Vérifie si déjà voté (cache local)
      if(myPredictionForMatch(id)) return;

      const payload = {
        match_id: id,
        choice: String(choice),
        user_key: predictionUserKey,
      };
      if(typeof currentUser !== 'undefined' && currentUser){
        payload.user_id = currentUser.id;
      }

      await upsertPrediction(payload);

      // Recharge les pronostics pour mettre à jour l'affichage
      await loadPredictions();
    }

    async function renderPredictionBox(matchId){
      const box = document.getElementById('predictionBox');
      if(!box) return;
      const m = data.find(x => String(x.id) === String(matchId));
      if(!m) return;
      const isKnockout = !String(m.phase||'').startsWith('Groupe');

      // Fermé si match commencé (live) ou terminé
      const k = matchStatusKey(m);
      if(k === 'live' || k === 'finished' || isPast(m)){
        const msg = k==='live' ? '⏱️ Match en cours' : '🔒 Match terminé';
        const sub = k==='live' ? 'Le pronostic est fermé depuis le coup d&apos;envoi.' : 'Les votes sont désactivés.';
        box.innerHTML = `<div class="prediction-card"><h3>${msg}</h3><p class="prediction-sub">${sub}</p></div>`;
        return;
      }

      // Pas connecté → bloc flouté
      const isLoggedIn = typeof currentUser !== 'undefined' && currentUser !== null;
      if(!isLoggedIn){
        box.innerHTML = `<div style="position:relative;border-radius:20px;overflow:hidden">
          <div style="filter:blur(4px);pointer-events:none;user-select:none;opacity:.65">
            <div class="prediction-card">
              <h3>🎯 Pronostic du match</h3>
              <p class="prediction-sub">Entre le score exact et gagne jusqu'à 5 pts.</p>
              <div class="pred-score-inputs">
                <div class="pred-team-col"><span>${esc(m.home)}</span><input type="number" value="1" min="0" max="20" class="pred-score-input" disabled></div>
                <span class="pred-dash">-</span>
                <div class="pred-team-col"><input type="number" value="0" min="0" max="20" class="pred-score-input" disabled><span>${esc(m.away)}</span></div>
              </div>
            </div>
          </div>
          <div onclick="openAuthModal()" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#06142299;backdrop-filter:blur(4px);border-radius:20px;border:1px solid #ffffff14;cursor:pointer">
            <div style="text-align:center;padding:20px">
              <div style="font-size:28px;margin-bottom:8px">🔒</div>
              <div style="color:#dcecff;font-weight:900;font-size:15px;margin-bottom:12px">Connecte-toi pour pronostiquer</div>
              <button onclick="event.stopPropagation();openAuthModal()" style="background:linear-gradient(90deg,#ffd166,#ff9f43);color:#061426;border:none;border-radius:14px;padding:11px 18px;font-weight:950;font-size:14px;cursor:pointer">Créer mon compte →</button>
            </div>
          </div>
        </div>`;
        return;
      }

      const already = myPredictionForMatch(matchId);
      const { counts, total } = predictionStatsForMatch(matchId);

      if(already){
        // Déjà voté : afficher le vote + stats
        const pred = (predictionRows||[]).find(r => String(r.match_id)===String(matchId) && (r.user_id===currentUser?.id || String(r.user_key)===String(predictionUserKey)));
        const sa = pred?.score_a_pick;
        const sb = pred?.score_b_pick;
        const qp = pred?.qualifier_pick;
        const hasScore = sa!==null&&sa!==undefined&&sb!==null&&sb!==undefined;
        const winnerLabel = already==='home'?m.home : already==='away'?m.away : 'Match nul';
        box.innerHTML = `<div class="prediction-card">
          <h3>✅ Ton pronostic</h3>
          ${hasScore
            ? `<div class="pred-voted-score">${esc(m.home)} <span>${sa} - ${sb}</span> ${esc(m.away)}</div>`
            : `<div class="pred-voted-score"><span>${esc(winnerLabel)}</span></div>`
          }
          ${qp?`<div class="pred-voted-qualifier">Se qualifie : <b>${esc(qp)}</b></div>`:''}
          <p class="prediction-sub" style="margin-top:8px">Score exact → 5pts · Bon vainqueur → 3pts</p>
          <span class="prediction-total">${total} vote${total>1?'s':''}</span>
          <button class="pred-modify-btn" onclick="cancelPrediction(${jsArg(matchId)})">✏️ Modifier mon pronostic</button>
        </div>`;
        return;
      }

      // Formulaire score exact
      box.innerHTML = `<div class="prediction-card">
        <div class="pred-rules-banner">🆕 Nouvelles règles · Score exact = <b>+5pts</b> · Bon vainqueur = <b>+3pts</b></div>
        <h3>🎯 Pronostic du match</h3>
        <p class="prediction-sub">Entre le score que tu penses voir à la fin du temps réglementaire.</p>
        <div class="pred-score-inputs">
          <div class="pred-team-col">
            <span class="pred-team-name">${esc(m.home)}</span>
            <input type="number" id="predScoreA" value="0" min="0" max="20" class="pred-score-input">
          </div>
          <span class="pred-dash">-</span>
          <div class="pred-team-col">
            <span class="pred-team-name">${esc(m.away)}</span>
            <input type="number" id="predScoreB" value="0" min="0" max="20" class="pred-score-input">
          </div>
        </div>
        ${isKnockout?`
        <div class="pred-qualifier-wrap" id="predQualifierWrap" style="display:none">
          <p class="prediction-sub">Score nul : qui se qualifie ?</p>
          <div class="pred-qualifier-btns">
            <button class="pred-qual-btn" id="predQualA" onclick="selectQualifier('${m.home}')">${esc(m.home)}</button>
            <button class="pred-qual-btn" id="predQualB" onclick="selectQualifier('${m.away}')">${esc(m.away)}</button>
          </div>
        </div>`:''}
        <button class="pred-submit-btn" id="predSubmitBtn" onclick="submitScorePrediction(${jsArg(matchId)})">Valider mon pronostic →</button>
        <span class="prediction-total">${total} vote${total>1?'s':''}</span>
      </div>`;

      if(isKnockout){
        // Afficher/masquer le sélecteur de qualifié si score nul
        function checkQualifier(){
          const a=parseInt(document.getElementById('predScoreA')?.value)||0;
          const b=parseInt(document.getElementById('predScoreB')?.value)||0;
          const wrap=document.getElementById('predQualifierWrap');
          if(wrap) wrap.style.display=(a===b)?'block':'none';
        }
        document.getElementById('predScoreA')?.addEventListener('input',checkQualifier);
        document.getElementById('predScoreB')?.addEventListener('input',checkQualifier);
      }
    }

    let _selectedQualifier = null;
    function selectQualifier(team){
      _selectedQualifier = team;
      document.querySelectorAll('.pred-qual-btn').forEach(b=>{
        b.classList.toggle('pred-qual-selected', b.textContent.trim()===team);
      });
    }

    async function submitScorePrediction(matchId){
      const sa = parseInt(document.getElementById('predScoreA')?.value);
      const sb = parseInt(document.getElementById('predScoreB')?.value);
      if(isNaN(sa)||isNaN(sb)){ alert('Entre un score valide.'); return; }

      const m = data.find(x=>String(x.id)===String(matchId));
      const isKnockout = m && !String(m.phase||'').startsWith('Groupe');

      // En phase finale, si score nul, qualifié obligatoire — affiche les boutons si pas encore choisi
      if(isKnockout && sa===sb && !_selectedQualifier){
        const wrap=document.getElementById('predQualifierWrap');
        if(wrap) wrap.style.display='block';
        return;
      }

      const qualifierPick = (isKnockout && sa===sb) ? _selectedQualifier : null;

      // Détermine le choice home/draw/away pour la rétrocompatibilité
      const choice = sa>sb ? 'home' : sa<sb ? 'away' : 'draw';

      try{
        const id = String(matchId);

        const payload = {
          match_id: id,
          choice,
          score_a_pick: sa,
          score_b_pick: sb,
          qualifier_pick: qualifierPick,
          user_key: predictionUserKey || String(Date.now()),
        };
        if(typeof currentUser !== 'undefined' && currentUser) payload.user_id = currentUser.id;

        // Écriture unique et sûre : POST, et si une ligne existe déjà (409/23505)
        // pour ce match+user (ex: déjà voté via le sondage FanZone), bascule en PATCH.
        await upsertPrediction(payload);

        _selectedQualifier = null;
        // Feedback visuel immédiat
        const submitBtn = document.getElementById('predSubmitBtn');
        if(submitBtn){
          submitBtn.textContent = '✅ Pronostic enregistré !';
          submitBtn.style.background = 'linear-gradient(90deg,#00a859,#00c96e)';
          submitBtn.disabled = true;
        }
        await loadPredictions();
        await renderPredictionBox(matchId);
        if(typeof currentUser !== 'undefined' && currentUser && typeof recalculateUserPoints === 'function'){
          await recalculateUserPoints(currentUser.id);
        }
      }catch(e){
        console.error(e);
        alert("Impossible d'enregistrer le pronostic pour le moment.");
      }
    }

    async function votePrediction(matchId, choice){
      try{
        await submitUnifiedPrediction(matchId, choice);
        await renderPredictionBox(matchId);
        // Recalcule les points si connecté
        if(typeof currentUser !== 'undefined' && currentUser && typeof recalculateUserPoints === 'function'){
          await recalculateUserPoints(currentUser.id);
        }
      }catch(e){
        console.error(e);
        alert("Impossible d'enregistrer le pronostic.");
      }
    }

    async function cancelPrediction(matchId, afterRender){
      const m = data.find(x=>String(x.id)===String(matchId));
      if(!m || matchStatusKey(m)==='live' || matchStatusKey(m)==='finished' || isPast(m)){
        alert('Le match a déjà commencé, impossible de modifier ton pronostic.');
        return;
      }
      try{
        // Supprimer TOUTES les lignes pour cet user+match (évite les doublons)
        const url = typeof currentUser !== 'undefined' && currentUser
          ? `match_predictions?user_id=eq.${currentUser.id}&match_id=eq.${String(matchId)}`
          : `match_predictions?user_key=eq.${predictionUserKey}&match_id=eq.${String(matchId)}`;

        if(typeof authFetch === 'function'){
          await authFetch(url, { method:'DELETE', headers:{ Prefer:'return=minimal' } });
        } else if(typeof supabaseFetch === 'function'){
          await supabaseFetch(url, { method:'DELETE' });
        }

        _selectedQualifier = null;
        delete _selectedQualifiersCompact[String(matchId)];
        // Vider localement predictionRows pour ce match puis re-rendre
        if(Array.isArray(window.predictionRows)){
          window.predictionRows = window.predictionRows.filter(r =>
            !(String(r.match_id)===String(matchId) &&
              (r.user_id===(currentUser?.id) || String(r.user_key)===String(predictionUserKey)))
          );
        }
        if(typeof predictionRows !== 'undefined' && Array.isArray(predictionRows)){
          predictionRows = predictionRows.filter(r =>
            !(String(r.match_id)===String(matchId) &&
              (r.user_id===(currentUser?.id) || String(r.user_key)===String(predictionUserKey)))
          );
        }
        if(typeof afterRender === 'function'){
          await afterRender(matchId);
        } else {
          await renderPredictionBox(matchId);
        }
      }catch(e){
        console.error('cancelPrediction error:', e);
      }
    }

    // ─── Widget compact pour la page Challenge (plusieurs matchs affichés en même temps) ───
    // Réutilise upsertPrediction/myPredictionForMatch/predictionStatsForMatch ci-dessus,
    // mais avec des ID DOM uniques par match (predScoreA/B sont uniques sur la fiche détail,
    // donc inutilisables tels quels quand 3 cartes de pronostic sont affichées à la fois).
    const _selectedQualifiersCompact = {};

    function selectQualifierCompact(matchId, team){
      const id = String(matchId);
      _selectedQualifiersCompact[id] = team;
      document.querySelectorAll(`.cpred-qual-btn[data-match="${id}"]`).forEach(b=>{
        b.classList.toggle('pred-qual-selected', b.textContent.trim()===team);
      });
    }

    function renderChallengeMatch(m){
      const id = String(m.id);
      const k = matchStatusKey(m);

      if(k==='live' || k==='finished' || isPast(m)){
        const msg = k==='live' ? '⏱️ Match en cours' : '🔒 Match terminé';
        return `<div class="poll-match-card"><b>${flags[m.home]||'🏳️'} ${esc(m.home)} vs ${flags[m.away]||'🏳️'} ${esc(m.away)}</b><div class="mini">${dateLabel(m.date)} · ${m.time}</div><div class="prediction-sub" style="margin-top:8px">${msg}</div></div>`;
      }

      const already = myPredictionForMatch(id);
      const { total } = predictionStatsForMatch(id);
      const isKnockout = !String(m.phase||'').startsWith('Groupe');

      if(already){
        const pred = (predictionRows||[]).find(r => String(r.match_id)===id && (r.user_id===currentUser?.id || String(r.user_key)===String(predictionUserKey)));
        const sa = pred?.score_a_pick, sb = pred?.score_b_pick;
        const qp = pred?.qualifier_pick;
        const hasScore = sa!==null && sa!==undefined && sb!==null && sb!==undefined;
        const winnerLabel = already==='home'?m.home:already==='away'?m.away:'Match nul';
        return `<div class="poll-match-card">
          <b>${flags[m.home]||'🏳️'} ${esc(m.home)} vs ${flags[m.away]||'🏳️'} ${esc(m.away)}</b>
          <div class="mini">${dateLabel(m.date)} · ${m.time} · ${total} vote${total>1?'s':''}</div>
          <div class="mini" style="margin-top:8px;color:#ffd166">
            Votre pronostic : <b>${hasScore?`${esc(m.home)} ${sa} - ${sb} ${esc(m.away)}`:esc(winnerLabel)}</b>${qp?` · Qualifié : <b>${esc(qp)}</b>`:''}
          </div>
          <button class="pred-modify-btn" style="margin-top:8px" onclick="cancelPrediction(${jsArg(id)}, () => { if(typeof renderFanZone==='function') renderFanZone(); })">✏️ Modifier</button>
        </div>`;
      }

      return `<div class="poll-match-card">
        <b>${flags[m.home]||'🏳️'} ${esc(m.home)} vs ${flags[m.away]||'🏳️'} ${esc(m.away)}</b>
        <div class="mini">${dateLabel(m.date)} · ${m.time}${total?` · ${total} vote${total>1?'s':''}`:''}</div>
        <div class="pred-score-inputs" style="margin-top:10px">
          <div class="pred-team-col"><span class="pred-team-name">${esc(m.home)}</span><input type="number" id="cpredScoreA_${id}" value="0" min="0" max="20" class="pred-score-input"></div>
          <span class="pred-dash">-</span>
          <div class="pred-team-col"><span class="pred-team-name">${esc(m.away)}</span><input type="number" id="cpredScoreB_${id}" value="0" min="0" max="20" class="pred-score-input"></div>
        </div>
        ${isKnockout?`
        <div class="pred-qualifier-wrap" id="cpredQualifierWrap_${id}" style="display:none">
          <p class="prediction-sub">Score nul : qui se qualifie ?</p>
          <div class="pred-qualifier-btns">
            <button class="pred-qual-btn cpred-qual-btn" data-match="${id}" onclick="selectQualifierCompact(${jsArg(id)},'${esc(m.home)}')">${esc(m.home)}</button>
            <button class="pred-qual-btn cpred-qual-btn" data-match="${id}" onclick="selectQualifierCompact(${jsArg(id)},'${esc(m.away)}')">${esc(m.away)}</button>
          </div>
        </div>`:''}
        <button class="pred-submit-btn" id="cpredSubmitBtn_${id}" style="margin-top:10px" onclick="submitScorePredictionCompact(${jsArg(id)})">Valider →</button>
      </div>`;
    }

    async function submitScorePredictionCompact(matchId){
      const id = String(matchId);
      const sa = parseInt(document.getElementById('cpredScoreA_'+id)?.value);
      const sb = parseInt(document.getElementById('cpredScoreB_'+id)?.value);
      if(isNaN(sa)||isNaN(sb)){ alert('Entre un score valide.'); return; }

      const m = data.find(x=>String(x.id)===id);
      if(!m) return;
      const isKnockout = !String(m.phase||'').startsWith('Groupe');

      if(isKnockout && sa===sb && !_selectedQualifiersCompact[id]){
        const wrap = document.getElementById('cpredQualifierWrap_'+id);
        if(wrap) wrap.style.display='block';
        return;
      }

      const qualifierPick = (isKnockout && sa===sb) ? _selectedQualifiersCompact[id] : null;
      const choice = sa>sb ? 'home' : sa<sb ? 'away' : 'draw';

      try{
        const payload = {
          match_id: id,
          choice,
          score_a_pick: sa,
          score_b_pick: sb,
          qualifier_pick: qualifierPick,
          user_key: predictionUserKey || String(Date.now()),
        };
        if(typeof currentUser !== 'undefined' && currentUser) payload.user_id = currentUser.id;

        await upsertPrediction(payload);

        delete _selectedQualifiersCompact[id];
        const btn = document.getElementById('cpredSubmitBtn_'+id);
        if(btn){
          btn.textContent = '✅ Enregistré !';
          btn.style.background = 'linear-gradient(90deg,#00a859,#00c96e)';
          btn.disabled = true;
        }
        await loadPredictions();
        if(typeof currentUser !== 'undefined' && currentUser && typeof recalculateUserPoints === 'function'){
          await recalculateUserPoints(currentUser.id);
        }
        if(typeof renderFanZone === 'function') renderFanZone();
      }catch(e){
        console.error(e);
        alert("Impossible d'enregistrer le pronostic pour le moment.");
      }
    }
