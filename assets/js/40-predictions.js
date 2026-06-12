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
        const rows=await supabaseRequest(`match_predictions?select=choice&match_id=eq.${encodeURIComponent(matchId)}`);
        const totals={home:0,draw:0,away:0};

        (rows||[]).forEach(r=>{
          const raw=String(r.choice||'').trim().toLowerCase();
          if(raw==='home' || raw==='domicile') totals.home++;
          else if(raw==='draw' || raw==='nul' || raw==='match nul') totals.draw++;
          else if(raw==='away' || raw==='extérieur' || raw==='exterieur') totals.away++;
          else{
            const m=data.find(x=>String(x.id)===String(matchId));
            if(m){
              if(raw===String(m.home||'').trim().toLowerCase()) totals.home++;
              else if(raw===String(m.away||'').trim().toLowerCase()) totals.away++;
            }
          }
        });

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
