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

    // Sauvegarde unifiée — utilise savePrediction() de 00-core-data.js
    // et ajoute user_id si connecté
    async function submitUnifiedPrediction(matchId, choice){
      const id = String(matchId);

      // Vérifie si déjà voté
      if(myPredictionForMatch(id)) return;

      // Payload de base
      const payload = {
        match_id: id,
        choice: String(choice),
        user_key: predictionUserKey,
      };

      // Ajoute user_id si connecté
      if(typeof currentUser !== 'undefined' && currentUser){
        payload.user_id = currentUser.id;
      }

      // Utilise authFetch si connecté pour envoyer le bon token
      // UPSERT : si une ligne existe déjà pour (match_id, user_key), on met à jour au lieu d'insérer
      if(typeof currentUser !== 'undefined' && currentUser && typeof authFetch === 'function'){
        try {
          await authFetch('match_predictions', {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(payload),
          });
        } catch(err) {
          // Conflit (déjà voté en anonyme) → met à jour la ligne existante
          if(String(err.message).includes('23505') || String(err.message).includes('duplicate')){
            await authFetch(`match_predictions?match_id=eq.${id}&user_key=eq.${predictionUserKey}`, {
              method: 'PATCH',
              headers: { Prefer: 'return=minimal' },
              body: JSON.stringify({ choice: String(choice), user_id: currentUser.id }),
            });
          } else {
            throw err;
          }
        }
      } else {
        await supabasePost('match_predictions', payload);
      }

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
          <p class="prediction-sub">Score nul → qui se qualifie ?</p>
          <div class="pred-qualifier-btns">
            <button class="pred-qual-btn" id="predQualA" onclick="selectQualifier(${jsArg(m.home)})">${esc(m.home)}</button>
            <button class="pred-qual-btn" id="predQualB" onclick="selectQualifier(${jsArg(m.away)})">${esc(m.away)}</button>
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

      // En phase finale, si score nul, qualifié obligatoire
      if(isKnockout && sa===sb && !_selectedQualifier){
        alert('Score nul en phase finale : indique qui se qualifie !');
        return;
      }

      const qualifierPick = (isKnockout && sa===sb) ? _selectedQualifier : null;

      // Détermine le choice home/draw/away pour la rétrocompatibilité
      const choice = sa>sb ? 'home' : sa<sb ? 'away' : 'draw';

      try{
        const id = String(matchId);
        if(myPredictionForMatch(id)) return;

        const payload = {
          match_id: id,
          choice,
          score_a_pick: sa,
          score_b_pick: sb,
          qualifier_pick: qualifierPick,
          user_key: predictionUserKey || String(Date.now()),
        };
        if(typeof currentUser !== 'undefined' && currentUser) payload.user_id = currentUser.id;

        if(typeof currentUser !== 'undefined' && currentUser && typeof authFetch === 'function'){
          await authFetch('match_predictions', {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(payload),
          });
        } else {
          await supabasePost('match_predictions', payload);
        }

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

    async function cancelPrediction(matchId){
      const m = data.find(x=>String(x.id)===String(matchId));
      if(!m || matchStatusKey(m)==='live' || matchStatusKey(m)==='finished' || isPast(m)){
        alert('Le match a déjà commencé, impossible de modifier ton pronostic.');
        return;
      }
      try{
        if(typeof currentUser !== 'undefined' && currentUser && typeof authFetch === 'function'){
          await authFetch(`match_predictions?user_id=eq.${currentUser.id}&match_id=eq.${matchId}`, {
            method: 'DELETE',
            headers: { Prefer: 'return=minimal' }
          });
        } else {
          // User non connecté : supprimer par user_key
          await supabaseDelete(`match_predictions?user_key=eq.${predictionUserKey}&match_id=eq.${matchId}`);
        }
        _selectedQualifier = null;
        // Recharger les données de prédictions depuis Supabase puis re-rendre
        if(typeof loadDynamicData === 'function'){
          await loadDynamicData();
        }
        await renderPredictionBox(matchId);
      }catch(e){
        console.error(e);
        alert("Impossible de modifier le pronostic pour le moment.");
      }
    }
