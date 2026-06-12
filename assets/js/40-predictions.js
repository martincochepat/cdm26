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

      await supabasePost('match_predictions', payload);

      // Recharge les pronostics pour mettre à jour l'affichage
      await loadPredictions();
    }

    async function renderPredictionBox(matchId){
      const box = document.getElementById('predictionBox');
      if(!box) return;
      const m = data.find(x => String(x.id) === String(matchId));
      if(!m) return;

      // Match terminé
      if(matchStatusKey(m) === 'finished' || isPast(m)){
        box.innerHTML = `<div class="prediction-card"><h3>🔒 Pronostic fermé</h3><p class="prediction-sub">Ce match est déjà terminé, les votes sont désactivés.</p></div>`;
        return;
      }

      // Pas connecté → bloc flouté
      const isLoggedIn = typeof currentUser !== 'undefined' && currentUser !== null;
      if(!isLoggedIn){
        const options = ['home','draw','away'];
        box.innerHTML = `<div style="position:relative;border-radius:20px;overflow:hidden">
          <div style="filter:blur(4px);pointer-events:none;user-select:none;opacity:.65">
            <div class="prediction-card">
              <h3>🔥 Pronostic du match</h3>
              <p class="prediction-sub">Qui va gagner ? Vote une seule fois.</p>
              <div class="prediction-options">
                ${options.map(choice => `<button class="prediction-option" disabled style="cursor:default">
                  <b>${esc(predictionLabel(m, choice))}</b>
                  <span>─</span>
                  <div class="prediction-bar" style="grid-column:1/-1"><i style="width:33%"></i></div>
                </button>`).join('')}
              </div>
            </div>
          </div>
          <div onclick="openAuthModal()" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#06142299;backdrop-filter:blur(4px);border-radius:20px;border:1px solid #ffffff14;cursor:pointer">
            <div style="text-align:center;padding:20px">
              <div style="font-size:28px;margin-bottom:8px">🔒</div>
              <div style="color:#dcecff;font-weight:900;font-size:15px;margin-bottom:12px;line-height:1.4">Connecte-toi pour pronostiquer<br>et gagner des points</div>
              <button onclick="event.stopPropagation();openAuthModal()" style="background:linear-gradient(90deg,#ffd166,#ff9f43);color:#061426;-webkit-text-fill-color:#061426;border:none;border-radius:14px;padding:11px 18px;font-weight:950;font-size:14px;cursor:pointer;font-family:inherit">Créer mon compte →</button>
            </div>
          </div>
        </div>`;
        return;
      }

      // Connecté → pronostic depuis predictionRows
      const already = myPredictionForMatch(matchId);
      const { counts, total } = predictionStatsForMatch(matchId);
      const options = ['home','draw','away'];

      box.innerHTML = `<div class="prediction-card">
        <h3>🔥 Pronostic du match</h3>
        <p class="prediction-sub">Qui va gagner ? Vote une seule fois.</p>
        <div class="prediction-options">
          ${options.map(choice => {
            const count = counts[choice] || 0;
            const pct = total ? Math.round(count * 100 / total) : 0;
            const selected = already === choice ? 'selected' : '';
            return `<button class="prediction-option ${selected}" ${already ? 'disabled' : ''} onclick="votePrediction(${jsArg(matchId)},'${choice}')">
              <b>${esc(predictionLabel(m, choice))}</b>
              <span>${pct}% · ${count}</span>
              <div class="prediction-bar" style="grid-column:1/-1"><i style="width:${pct}%"></i></div>
            </button>`;
          }).join('')}
        </div>
        <span class="prediction-total">${total} vote${total > 1 ? 's' : ''}</span>
        <div class="prediction-note">${already ? 'Merci pour ton vote ✅' : 'Les résultats s\'actualisent après ton vote.'}</div>
      </div>`;
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
        alert('Impossible d\'enregistrer le pronostic pour le moment.');
      }
    }
