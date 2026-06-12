// V77 — Pronostics visiteurs synchronisés Supabase + gating compte
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

      // Match terminé
      if(matchStatusKey(m)==='finished' || isPast(m)){
        box.innerHTML=`<div class="prediction-card"><h3>🔒 Pronostic fermé</h3><p class="prediction-sub">Ce match est déjà terminé, les votes sont désactivés.</p></div>`;
        return;
      }

      // Pas connecté → bloc flouté avec invitation
      const isLoggedIn = typeof currentUser !== 'undefined' && currentUser !== null;
      if(!isLoggedIn){
        const options=['home','draw','away'];
        box.innerHTML=`<div style="position:relative;border-radius:20px;overflow:hidden">
          <div style="filter:blur(4px);pointer-events:none;user-select:none;opacity:.65">
            <div class="prediction-card">
              <h3>🔥 Pronostic du match</h3>
              <p class="prediction-sub">Qui va gagner ? Vote une seule fois.</p>
              <div class="prediction-options">
                ${options.map(choice=>`<button class="prediction-option" disabled style="cursor:default">
                  <b>${esc(predictionLabel(m,choice))}</b>
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

      // Connecté → pronostic normal
      const already=localStorage.getItem(predictionStorageKey(matchId));
      const totals=await fetchPredictions(matchId);
      const total=totals.home+totals.draw+totals.away;
      const options=['home','draw','away'];

      box.innerHTML=`<div class="prediction-card">
        <h3>🔥 Pronostic du match</h3>
        <p class="prediction-sub">Qui va gagner ? Vote une seule fois.</p>
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
        <div class="prediction-note">${already?'Merci pour ton vote ✅':'Les résultats s\'actualisent après ton vote.'}</div>
      </div>`;
    }

    async function votePrediction(matchId,choice){
      try{
        await submitPrediction(matchId,choice);
        await renderPredictionBox(matchId);
      }catch(e){
        console.error(e);
        alert('Impossible d\'enregistrer le pronostic pour le moment.');
      }
    }
