// Guide Mondial 2026 — Module Auth + Classement Challenge
// V1 — Magic Link Supabase + Pseudo + Points pronostics/quiz

const AUTH_SUPABASE_URL = 'https://lclnnxirkuuwexxcmmho.supabase.co';
const AUTH_SUPABASE_KEY = 'sb_publishable_F-2bOXBmO23_FfRv5KTqXg_jP2osQM2';

let currentUser = null;
let currentProfile = null;
let leaderboardRows = [];

// ─── Helpers Supabase Auth ─────────────────────────────────────────────────

async function authFetch(path, options = {}) {
  const session = await getSession();
  const token = session?.access_token || AUTH_SUPABASE_KEY;
  const headers = Object.assign(options.headers || {}, {
    apikey: AUTH_SUPABASE_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });
  const res = await fetch(`${AUTH_SUPABASE_URL}/rest/v1/${path}`, Object.assign({ headers, cache: 'no-store' }, options));
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch(_) { return null; }
}

async function getSession() {
  try {
    const raw = localStorage.getItem('sb-lclnnxirkuuwexxcmmho-auth-token');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token) return null;

    const now = Date.now() / 1000;
    const expiresAt = parsed?.expires_at || 0;

    // Token expiré → déconnexion
    if (expiresAt && now > expiresAt) {
      // Tente un refresh si on a un refresh_token
      if (parsed?.refresh_token) {
        try {
          const res = await fetch(`${AUTH_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { apikey: AUTH_SUPABASE_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: parsed.refresh_token })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.access_token) {
              const newSession = {
                access_token: data.access_token,
                refresh_token: data.refresh_token || parsed.refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
              };
              localStorage.setItem('sb-lclnnxirkuuwexxcmmho-auth-token', JSON.stringify(newSession));
              return newSession;
            }
          }
        } catch (_) {}
      }
      // Refresh impossible → supprime la session
      localStorage.removeItem('sb-lclnnxirkuuwexxcmmho-auth-token');
      return null;
    }

    // Token expire dans moins de 10 min → refresh préventif en arrière-plan
    if (expiresAt && now > expiresAt - 600 && parsed?.refresh_token) {
      fetch(`${AUTH_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: AUTH_SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: parsed.refresh_token })
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (data?.access_token) {
          localStorage.setItem('sb-lclnnxirkuuwexxcmmho-auth-token', JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token || parsed.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
          }));
        }
      }).catch(() => {});
    }

    return parsed;
  } catch (_) { return null; }
}

async function getUser() {
  const session = await getSession();
  if (!session?.access_token) return null;
  try {
    const res = await fetch(`${AUTH_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: AUTH_SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
      }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (_) { return null; }
}

// ─── Magic Link ────────────────────────────────────────────────────────────

async function sendMagicLink(email) {
  const res = await fetch(`${AUTH_SUPABASE_URL}/auth/v1/otp`, {
    method: 'POST',
    headers: {
      apikey: AUTH_SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || err.message || 'Erreur envoi email');
  }
  return true;
}

async function signOut() {
  const session = await getSession();
  if (session?.access_token) {
    await fetch(`${AUTH_SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: AUTH_SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
      }
    }).catch(() => {});
  }
  localStorage.removeItem('sb-lclnnxirkuuwexxcmmho-auth-token');
  currentUser = null;
  currentProfile = null;
  renderChallenge();
}

// ─── Profil utilisateur ────────────────────────────────────────────────────

async function loadProfile(userId) {
  try {
    const rows = await authFetch(`user_profiles?id=eq.${userId}&select=*`);
    return rows && rows[0] ? rows[0] : null;
  } catch (_) { return null; }
}

async function createProfile(userId, pseudo, avatarEmoji = '⚽') {
  const session = await getSession();
  const token = session?.access_token || AUTH_SUPABASE_KEY;
  const res = await fetch(`${AUTH_SUPABASE_URL}/rest/v1/user_profiles`, {
    method: 'POST',
    headers: {
      apikey: AUTH_SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ id: userId, pseudo, avatar_emoji: avatarEmoji }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows && rows[0] ? rows[0] : null;
}

async function loadLeaderboard() {
  try {
    leaderboardRows = await authFetch(
      'user_profiles?select=pseudo,avatar_emoji,points,predictions_correct,predictions_total,quiz_correct&order=points.desc&limit=50'
    );
  } catch (_) { leaderboardRows = []; }
}

// ─── Gestion du token dans l'URL (retour Magic Link) ──────────────────────

async function handleAuthCallback() {
  const hash = window.location.hash;
  if (!hash.includes('access_token')) return false;

  const params = new URLSearchParams(hash.replace('#', ''));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const expires_in = params.get('expires_in');

  if (!access_token) return false;

  const session = {
    access_token,
    refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(expires_in || 3600),
  };
  localStorage.setItem('sb-lclnnxirkuuwexxcmmho-auth-token', JSON.stringify(session));
  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
}

// ─── Calcul des points ─────────────────────────────────────────────────────
// Appelé automatiquement quand loadDynamicData() met à jour les matchs

async function recalculateUserPoints(userId) {
  try {
    // Récupère tous les pronostics de l'utilisateur
    const preds = await authFetch(`match_predictions?user_id=eq.${userId}&select=match_id,choice,score_a_pick,score_b_pick,qualifier_pick`);

    let points = 0;
    let correct = 0;
    let total = (preds || []).length;

    for (const pred of preds) {
      const match = data.find(m => String(m.id) === String(pred.match_id));
      if (!match || (match.status !== 'finished' && matchStatusKey(match) !== 'finished')) continue;
      if (match.score_a === null || match.score_b === null) continue;

      const realA = Number(match.score_a);
      const realB = Number(match.score_b);
      const realResult = realA > realB ? 'home' : realA < realB ? 'away' : 'draw';

      // Score exact → +5pts
      if (pred.score_a_pick !== null && pred.score_a_pick !== undefined &&
          pred.score_b_pick !== null && pred.score_b_pick !== undefined &&
          Number(pred.score_a_pick) === realA && Number(pred.score_b_pick) === realB) {
        // En phase finale avec nul : vérifier aussi le qualifié
        const isKnockout = !String(match.phase||'').startsWith('Groupe');
        if (isKnockout && realResult === 'draw') {
          const realWinner = match.winner && match.winner !== 'draw' ? match.winner : null;
          if (realWinner && pred.qualifier_pick === realWinner) {
            points += 5;
            correct++;
          } else if (!pred.qualifier_pick) {
            // Score exact sans qualifié → +3pts quand même
            points += 3;
            correct++;
          }
        } else {
          points += 5;
          correct++;
        }
      }
      // Bon vainqueur (pas score exact) → +3pts
      else if (pred.choice === realResult) {
        // Phase finale nul : vérifier le qualifié
        const isKnockout = !String(match.phase||'').startsWith('Groupe');
        if (isKnockout && realResult === 'draw' && pred.qualifier_pick) {
          const realWinner = match.winner && match.winner !== 'draw' ? match.winner : null;
          if (realWinner && pred.qualifier_pick === realWinner) {
            points += 3;
            correct++;
          }
        } else if (!(isKnockout && realResult === 'draw' && !pred.qualifier_pick)) {
          points += 3;
          correct++;
        }
      }
    }

    // Points quiz
    const quizAnswers = await authFetch(`user_quiz_answers?user_id=eq.${userId}&select=points_earned`);
    const quizPoints = (quizAnswers || []).reduce((sum, r) => sum + (r.points_earned || 0), 0);
    const quizCorrect = (quizAnswers || []).filter(r => r.points_earned > 0).length;

    points += quizPoints;

    // Points bonus : pronostic vainqueur du tournoi (+15 pts)
    try {
      const finalMatch = data.find(m => String(m.phase||'').toLowerCase() === 'finale');
      if (finalMatch && matchStatusKey(finalMatch) === 'finished' && finalMatch.score_a !== null && finalMatch.score_b !== null) {
        const profileRows = await authFetch(`user_profiles?id=eq.${userId}&select=tournament_winner_pick`);
        const pick = profileRows && profileRows[0] ? profileRows[0].tournament_winner_pick : null;
        if (pick) {
          const finalWinner = finalMatch.score_a > finalMatch.score_b ? finalMatch.home
            : finalMatch.score_a < finalMatch.score_b ? finalMatch.away
            : null;
          if (finalWinner && pick === finalWinner) {
            points += 15;
          }
        }
      }
    } catch(_) {}

    // Met à jour le profil
    await authFetch(`user_profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        points,
        predictions_correct: correct,
        predictions_total: total,
        quiz_correct: quizCorrect,
        updated_at: new Date().toISOString(),
      })
    });
  } catch (err) {
    console.warn('Recalcul points échoué', err);
  }
}

// ─── Rendu ─────────────────────────────────────────────────────────────────


// ─── Mise à jour fluide des données Challenge (sans flash) ─────────────────
// Appelé périodiquement : ne modifie que le texte/valeurs qui changent,
// sans toucher au DOM des blocs déjà affichés (pas de scroll-jump, pas de flash).

function updateChallengeData() {
  if (!currentUser || !currentProfile) return;
  const box = document.getElementById('challengeBox');
  if (!box) return;

  const myRank = leaderboardRows.findIndex(r => r.pseudo === currentProfile.pseudo) + 1;

  // 1. Pills du profil (points, rang, pronos, quiz)
  const rankPill = document.getElementById('myRankPill');
  if (rankPill) {
    if (myRank) {
      rankPill.style.display = '';
      rankPill.textContent = `🏅 #${myRank}`;
    } else {
      rankPill.style.display = 'none';
    }
  }
  const pointsPill = document.getElementById('myPointsPill');
  if (pointsPill) pointsPill.textContent = `${currentProfile.points} pts`;
  const predsPill = document.getElementById('myPredsPill');
  if (predsPill) predsPill.textContent = `${currentProfile.predictions_correct}/${currentProfile.predictions_total} pronos`;
  const quizPill = document.getElementById('myQuizPill');
  if (quizPill) quizPill.textContent = `${currentProfile.quiz_correct} quiz ✓`;

  // 2. Classement : met à jour les points/largeur des barres existantes,
  //    et ne fait un re-render complet que si la liste de joueurs a changé
  const lbContainer = document.getElementById('challengeLeaderboard');
  if (lbContainer) {
    const existingRows = [...lbContainer.querySelectorAll('.lb-row')];
    const existingPseudos = existingRows.map(r => r.dataset.pseudo);
    const newPseudos = leaderboardRows.map(r => r.pseudo);
    const samePseudos = existingPseudos.length === newPseudos.length &&
      existingPseudos.every((p, i) => p === newPseudos[i]);

    if (samePseudos) {
      // Même ordre/joueurs : on patch juste les points et les barres
      const maxPts = leaderboardRows[0]?.points || 1;
      leaderboardRows.forEach((r, i) => {
        const row = existingRows[i];
        if (!row) return;
        const ptsEl = row.querySelector('.lb-pts b');
        if (ptsEl && ptsEl.textContent !== String(r.points)) ptsEl.textContent = r.points;
        const barEl = row.querySelector('.lb-bar-fill');
        if (barEl) {
          const pct = Math.max(4, Math.round((r.points / maxPts) * 100));
          barEl.style.width = pct + '%';
        }
      });
    } else {
      // Ordre/joueurs différent : re-render seulement le classement (pas tout le bloc)
      const newLb = renderLeaderboard(myRank);
      if (lbContainer.parentElement) {
        const temp = document.createElement('div');
        temp.innerHTML = newLb;
        lbContainer.replaceWith(temp.firstElementChild);
      }
    }
  }

  // 3. Bonus : si le statut verrouillé a changé, re-render uniquement ce bloc
  const bonusLocked = currentProfile.tournament_winner_locked || isGroupStageOver();
  const bonusContainer = box.querySelector('[data-bonus-locked]');
  if (bonusContainer) {
    const currentLocked = bonusContainer.dataset.bonusLocked === 'true';
    if (currentLocked !== bonusLocked) {
      const temp = document.createElement('div');
      temp.innerHTML = renderBonusBlock();
      bonusContainer.replaceWith(temp.firstElementChild);
    }
  }

  // 4. Historique des pronostics : re-render seulement si le contenu a changé
  if (currentUser) {
    renderPredictionHistory().then(html => {
      const container = document.getElementById('predictionHistoryContainer');
      if (container && container.innerHTML.trim() !== html.trim()) {
        container.innerHTML = html;
      }
    });
  }
}

function renderChallenge() {
  const box = document.getElementById('challengeBox');
  if (!box) return;

  const myRank = currentProfile
    ? leaderboardRows.findIndex(r => r.pseudo === currentProfile.pseudo) + 1
    : 0;

  const newHtml = `
    ${renderAuthBlock(myRank)}
    ${renderBonusBlock()}
    ${renderLeaderboard(myRank)}
    <div id="predictionHistoryContainer"></div>
  `;

  // Ne réécrit le DOM que si le contenu a réellement changé (évite le flash/scroll-jump)
  if (box.innerHTML.trim() !== newHtml.trim()) {
    // Préserve le scroll de la page pendant la mise à jour
    const scrollY = window.scrollY;
    box.innerHTML = newHtml;
    window.scrollTo(0, scrollY);
  }

  // Charge l'historique de façon async (nécessite authFetch)
  if (currentUser) {
    renderPredictionHistory().then(html => {
      const container = document.getElementById('predictionHistoryContainer');
      if (container && container.innerHTML.trim() !== html.trim()) {
        container.innerHTML = html;
      }
    });
  }
}

function renderAuthBlock(myRank) {
  if (!currentUser) {
    return `
      <div style="background:linear-gradient(135deg,#0d2a4a,#1a0d2e);border:1px solid #ffffff18;border-radius:22px;padding:28px 24px;margin-bottom:4px">
        <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-bottom:20px">
          <div style="flex:1;min-width:180px">
            <div style="font-size:clamp(20px,4vw,28px);font-weight:950;margin:0 0 10px;background:linear-gradient(90deg,#ffd166,#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1">🔥 Qui pronostique le mieux ?</div>
            <p style="color:#b9c9d8;line-height:1.65;margin:0;font-size:15px">Vote sur chaque match, réponds au quiz du jour.<br>Les points tombent dès que les résultats sont officiels.</p>
          </div>
          <div style="display:flex;gap:10px;flex-shrink:0">
            <div style="display:flex;flex-direction:column;align-items:center;background:#ffffff0d;border:1px solid #ffffff22;border-radius:16px;padding:14px 18px;font-size:13px;gap:5px;color:#eaf5ff;text-align:center">🎯 Score exact<b style="color:#ffd166;font-size:19px;font-weight:950;display:block">+5 pts</b></div>
            <div style="display:flex;flex-direction:column;align-items:center;background:#ffffff0d;border:1px solid #ffffff22;border-radius:16px;padding:14px 18px;font-size:13px;gap:5px;color:#eaf5ff;text-align:center">✅ Bon vainqueur<b style="color:#ffd166;font-size:19px;font-weight:950;display:block">+3 pts</b></div>
            <div style="display:flex;flex-direction:column;align-items:center;background:#ffffff0d;border:1px solid #ffffff22;border-radius:16px;padding:14px 18px;font-size:13px;gap:5px;color:#eaf5ff;text-align:center">🧠 Quiz<b style="color:#ffd166;font-size:19px;font-weight:950;display:block">+2 pts</b></div>
          </div>
        </div>
        <button onclick="openAuthModal()" style="display:block;width:100%;padding:20px;background:linear-gradient(90deg,#ffd166,#ff9f43);color:#061426;-webkit-text-fill-color:#061426;border:none;border-radius:18px;font-weight:950;font-size:17px;cursor:pointer;box-shadow:0 14px 40px #ffd16633;font-family:inherit;text-align:center">
          🏆 Se connecter · Rejoindre le classement
        </button>
      </div>
    `;
  }

  if (!currentProfile) {
    const emojiList = ['⚽','🏆','🔥','⚡','🦁','🦅','🐺','🎯','🌟','💪'];
    const emojiButtons = emojiList.map(function(e) {
      return '<button onclick="selectEmoji(' + "'" + e + "'" + ')" id="emoji-' + e + '" style="background:#ffffff0d;border:2px solid transparent;border-radius:12px;padding:10px;font-size:22px;cursor:pointer;font-family:inherit;transition:all .15s">' + e + '</button>';
    }).join('');
    return `
      <div style="background:linear-gradient(135deg,#0d2a4a,#1a0d2e);border:1px solid #ffffff18;border-radius:22px;padding:28px 24px">
        <div style="font-size:clamp(20px,4vw,26px);font-weight:950;margin:0 0 10px;background:linear-gradient(90deg,#ffd166,#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent">👋 Dernière étape !</div>
        <p style="color:#b9c9d8;line-height:1.65;margin:0 0 16px;font-size:15px">Connecté avec <b>${esc(currentUser.email)}</b><br>Choisis ton avatar et ton pseudo pour apparaître dans le classement.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${emojiButtons}</div>
        <input id="pseudoInput" type="text" placeholder="Choisis ton pseudo (ex: MartinC)" maxlength="20" autocomplete="off" style="display:block;width:100%;box-sizing:border-box;background:#020b16;border:1px solid #ffffff25;border-radius:14px;padding:15px 16px;color:#eaf5ff;font-size:16px;font-family:inherit;margin-bottom:12px;outline:none">
        <button onclick="handleCreateProfile()" style="display:block;width:100%;padding:16px;background:linear-gradient(90deg,#ffd166,#ff9f43);color:#061426;-webkit-text-fill-color:#061426;border:none;border-radius:14px;font-weight:950;font-size:16px;cursor:pointer;font-family:inherit">Lancer mon profil →</button>
        <div id="pseudoStatus" style="margin-top:10px;font-size:14px;color:#b9c9d8"></div>
        <button onclick="signOut()" style="background:transparent;border:1px solid #ffffff20;color:#8fa6bd;-webkit-text-fill-color:#8fa6bd;border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;font-weight:700;margin-top:12px;font-family:inherit">Se déconnecter</button>
      </div>
    `;
  }

  return `
    <div style="background:linear-gradient(135deg,#0d2a4a,#1a0d2e);border:1px solid #ffffff18;border-radius:22px;padding:22px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
      <div style="display:flex;align-items:center;gap:14px;flex:1;flex-wrap:wrap">
        <span style="font-size:40px;line-height:1">${esc(currentProfile.avatar_emoji)}</span>
        <div>
          <div style="font-size:clamp(18px,3vw,24px);font-weight:950;background:linear-gradient(90deg,#ffd166,#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 8px">${esc(currentProfile.pseudo)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${myRank ? `<span id="myRankPill" style="background:#ffffff12;border:1px solid #ffffff18;border-radius:99px;padding:5px 12px;font-size:13px;font-weight:700">🏅 #${myRank}</span>` : '<span id="myRankPill" style="display:none"></span>'}
            <span id="myPointsPill" style="background:#ffffff12;border:1px solid #ffffff18;border-radius:99px;padding:5px 12px;font-size:13px;font-weight:700">${currentProfile.points} pts</span>
            <span id="myPredsPill" style="background:#ffffff12;border:1px solid #ffffff18;border-radius:99px;padding:5px 12px;font-size:13px;font-weight:700">${currentProfile.predictions_correct}/${currentProfile.predictions_total} pronos</span>
            <span id="myQuizPill" style="background:#ffffff12;border:1px solid #ffffff18;border-radius:99px;padding:5px 12px;font-size:13px;font-weight:700">${currentProfile.quiz_correct} quiz ✓</span>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div id="notifBtnContainer"><button onclick="toggleNotifications()" style="background:linear-gradient(90deg,#ffd16622,#ff9f4322);border:1px solid #ffd16644;color:#ffd166;-webkit-text-fill-color:#ffd166;border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;font-weight:700;font-family:inherit">🔔 Activer les notifs</button></div>
        <button onclick="signOut()" style="background:transparent;border:1px solid #ffffff20;color:#8fa6bd;-webkit-text-fill-color:#8fa6bd;border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;font-weight:700;font-family:inherit">Se déconnecter</button>
      </div>
    </div>
  `;
  setTimeout(refreshNotifBtn, 1000);
}


function openAuthModal() {
  if (!document.getElementById('authModal')) {
    var div = document.createElement('div');
    div.id = 'authModal';
    div.onclick = function(e) { if(e.target.id==='authModal') closeAuthModal(); };
    div.setAttribute('style','position:fixed;inset:0;background:#000000bb;backdrop-filter:blur(12px);z-index:99999;display:none;align-items:center;justify-content:center;padding:20px');
    div.innerHTML = `<div style="background:linear-gradient(145deg,#0b223c,#1b1025);border:1px solid #ffffff22;border-radius:28px;padding:36px 32px;max-width:460px;width:100%;position:relative;box-shadow:0 40px 100px #000000aa"><button onclick="closeAuthModal()" style="position:absolute;top:16px;right:16px;background:#ffffff15;border:1px solid #ffffff22;color:#fff;-webkit-text-fill-color:#fff;border-radius:99px;width:34px;height:34px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit">✕</button><div id="authStep1"><div style="font-size:52px;text-align:center;margin-bottom:14px">🏆</div><div style="font-size:26px;font-weight:950;margin:0 0 12px;background:linear-gradient(90deg,#ffd166,#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center">Rejoins le classement</div><p style="color:#b9c9d8;line-height:1.65;margin:0 0 20px;font-size:15px;text-align:center">Entre ton email, on t'envoie un lien magique. Pas de mot de passe.</p><input id="magicEmail" type="email" placeholder="ton@email.fr" autocomplete="email" style="display:block;width:100%;box-sizing:border-box;background:#020b16;border:1px solid #ffffff25;border-radius:14px;padding:15px 16px;color:#eaf5ff;font-size:16px;font-family:inherit;margin-bottom:12px;outline:none"><button onclick="handleMagicLink()" style="display:block;width:100%;padding:16px;background:linear-gradient(90deg,#ffd166,#ff9f43);color:#061426;-webkit-text-fill-color:#061426;border:none;border-radius:14px;font-weight:950;font-size:16px;cursor:pointer;font-family:inherit">Envoyer le lien →</button><div id="magicStatus" style="margin-top:10px;font-size:14px;color:#b9c9d8;text-align:center"></div></div><div id="authStep2" style="display:none"><div style="font-size:52px;text-align:center;margin-bottom:14px">📬</div><div style="font-size:26px;font-weight:950;margin:0 0 12px;background:linear-gradient(90deg,#ffd166,#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center">Entre ton code</div><p style="color:#b9c9d8;line-height:1.65;margin:0 0 20px;font-size:15px;text-align:center">Code envoyé à <b id="sentEmailDisplay"></b></p><input id="otpCode" type="number" placeholder="123456" style="display:block;width:100%;box-sizing:border-box;background:#020b16;border:1px solid #ffffff25;border-radius:14px;padding:15px;color:#eaf5ff;font-size:28px;font-family:inherit;margin-bottom:12px;outline:none;text-align:center"><button onclick="handleVerifyOTP()" style="display:block;width:100%;padding:16px;background:linear-gradient(90deg,#ffd166,#ff9f43);color:#061426;-webkit-text-fill-color:#061426;border:none;border-radius:14px;font-weight:950;font-size:16px;cursor:pointer;font-family:inherit">Valider le code →</button><div id="otpStatus" style="margin-top:10px;font-size:14px;color:#b9c9d8;text-align:center"></div></div></div>`;
    document.body.appendChild(div);
  }
  var modal = document.getElementById('authModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}
function showStep(n) {
  document.getElementById('authStep1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('authStep2').style.display = n === 2 ? 'block' : 'none';
}

function renderLeaderboard(myRank) {
  if (!leaderboardRows.length) {
    return `<div class="challenge-empty">Aucun joueur pour l'instant — sois le premier ! 🏆</div>`;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const rows = leaderboardRows.map((r, i) => {
    const isMe = currentProfile && r.pseudo === currentProfile.pseudo;
    const rank = i + 1;
    const maxPts = leaderboardRows[0].points || 1;
    const pct = Math.max(4, Math.round((r.points / maxPts) * 100));

    return `
      <div class="lb-row ${isMe ? 'lb-me' : ''}" data-pseudo="${esc(r.pseudo)}">
        <span class="lb-rank">${medals[i] || rank}</span>
        <span class="lb-avatar">${esc(r.avatar_emoji)}</span>
        <div class="lb-info">
          <b>${esc(r.pseudo)}</b>
          <div class="lb-bar"><div class="lb-bar-fill" style="width:${pct}%"></div></div>
        </div>
        <span class="lb-pts"><b>${r.points}</b><small>pts</small></span>
      </div>
    `;
  }).join('');

  return `
    <div class="challenge-leaderboard" id="challengeLeaderboard">
      <h3 style="margin:0 0 14px">🏆 Classement</h3>
      ${rows}
      ${!currentUser ? `<div class="lb-cta">Rejoins le classement pour apparaître ici ↑</div>` : ''}
    </div>
  `;
}

// ─── Handlers UI ───────────────────────────────────────────────────────────

let selectedEmoji = '⚽';
function selectEmoji(e) {
  selectedEmoji = e;
  document.querySelectorAll('.emoji-btn').forEach(b => {
    b.style.border = '2px solid transparent';
    b.style.background = '#ffffff0d';
    b.style.transform = 'scale(1)';
  });
  const btn = document.getElementById('emoji-' + e);
  if (btn) {
    btn.style.border = '2px solid #ffd166';
    btn.style.background = '#ffd16622';
    btn.style.transform = 'scale(1.2)';
  }
}

async function handleMagicLink() {
  const email = document.getElementById('magicEmail')?.value?.trim();
  const status = document.getElementById('magicStatus');
  if (!email || !email.includes('@')) {
    if (status) status.innerHTML = '<span class="err">Entre une adresse email valide.</span>';
    return;
  }
  if (status) status.innerHTML = 'Envoi en cours...';
  try {
    await sendMagicLink(email);
    const emailEl = document.getElementById('magicEmail');
    const sentDisplay = document.getElementById('sentEmailDisplay');
    if (sentDisplay && emailEl) sentDisplay.textContent = emailEl.value;
    window._otpEmail = document.getElementById('magicEmail')?.value?.trim() || '';
    showStep(2);
  } catch (err) {
    if (status) status.innerHTML = `<span class="err">Erreur : ${esc(err.message)}</span>`;
  }
}


async function verifyOTP(email, token) {
  const res = await fetch(`${AUTH_SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: { apikey: AUTH_SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, type: 'email' })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || err.message || 'Code invalide');
  }
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('sb-lclnnxirkuuwexxcmmho-auth-token', JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
    }));
  }
  return data;
}

async function handleVerifyOTP() {
  const email = window._otpEmail || '';
  const code = document.getElementById('otpCode')?.value?.trim();
  const status = document.getElementById('otpStatus');
  if (!code || code.length < 6) {
    if (status) status.innerHTML = '<span style="color:#ff6b6b">Entre le code à 6 chiffres.</span>';
    return;
  }
  if (status) status.innerHTML = 'Vérification...';
  try {
    await verifyOTP(email, code);
    closeAuthModal();
    currentUser = await getUser();
    if (currentUser) {
      currentProfile = await loadProfile(currentUser.id);
      if (currentProfile) {
        await recalculateUserPoints(currentUser.id);
        currentProfile = await loadProfile(currentUser.id);
      }
    }
    await loadLeaderboard();
    renderChallenge();
    if (typeof renderFanZone === 'function') renderFanZone();
  } catch (err) {
    if (status) status.innerHTML = `<span style="color:#ff6b6b">${esc(err.message)}</span>`;
  }
}

async function handleCreateProfile() {
  const pseudo = document.getElementById('pseudoInput')?.value?.trim();
  const status = document.getElementById('pseudoStatus');
  if (!pseudo || pseudo.length < 2) {
    if (status) status.innerHTML = '<span class="err">Pseudo trop court (2 caractères minimum).</span>';
    return;
  }
  if (pseudo.length > 20) {
    if (status) status.innerHTML = '<span class="err">Pseudo trop long (20 caractères maximum).</span>';
    return;
  }
  if (status) status.innerHTML = 'Création du profil...';
  try {
    const profile = await createProfile(currentUser.id, pseudo, selectedEmoji);
    if (!profile) throw new Error('Profil non créé');
    currentProfile = profile;
    await loadLeaderboard();
    renderChallenge();
    if (typeof renderFanZone === 'function') renderFanZone();
    // Activation auto des notifications à la création du compte
    enableNotifications();
  } catch (err) {
    const msg = err.message.includes('unique') ? 'Ce pseudo est déjà pris, choisis-en un autre.' : err.message;
    if (status) status.innerHTML = `<span class="err">${esc(msg)}</span>`;
  }
}

// ─── Notifications OneSignal ───────────────────────────────────────────────

async function initNotifications() {
  if (!window.OneSignalDeferred) return;
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: 'b3e956ce-d830-4ad3-9fc9-383ac8c5bb87',
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true,
    });
    refreshNotifBtn();
  });
}

function isNotifSubscribed() {
  try {
    return !!(window.OneSignal && window.OneSignal.User && window.OneSignal.User.PushSubscription && window.OneSignal.User.PushSubscription.optedIn);
  } catch(_) { return false; }
}

function refreshNotifBtn() {
  const container = document.getElementById('notifBtnContainer');
  if (!container) return;
  if (isNotifSubscribed()) {
    container.innerHTML = '<button onclick="toggleNotifications()" style="background:transparent;border:1px solid #00a85955;color:#00a859;-webkit-text-fill-color:#00a859;border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;font-weight:700;font-family:inherit">🔔 Notifs activées</button>';
  } else {
    container.innerHTML = '<button onclick="toggleNotifications()" style="background:linear-gradient(90deg,#ffd16622,#ff9f4322);border:1px solid #ffd16644;color:#ffd166;-webkit-text-fill-color:#ffd166;border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;font-weight:700;font-family:inherit">🔔 Activer les notifs</button>';
  }
}

async function enableNotifications() {
  if (!window.OneSignal) return;
  try {
    await window.OneSignal.Notifications.requestPermission();
    setTimeout(refreshNotifBtn, 500);
  } catch(_) {}
}

async function toggleNotifications() {
  if (!window.OneSignal) {
    alert('Notifications non disponibles sur ce navigateur.');
    return;
  }
  try {
    if (isNotifSubscribed()) {
      await window.OneSignal.User.PushSubscription.optOut();
    } else {
      await window.OneSignal.Notifications.requestPermission();
    }
    setTimeout(refreshNotifBtn, 500);
  } catch(err) {
    console.warn('Notif error:', err);
  }
}

// ─── Pronostic Bonus : vainqueur du tournoi (+15 pts) ──────────────────────

const WC26_TEAMS = ["Afrique du Sud", "Algérie", "Allemagne", "Angleterre", "Arabie saoudite", "Argentine", "Australie", "Autriche", "Belgique", "Bosnie-Herzégovine", "Brésil", "Canada", "Cap-Vert", "Colombie", "Corée du Sud", "Croatie", "Curaçao", "Côte d'Ivoire", "Equateur", "Espagne", "France", "Ghana", "Haïti", "Irak", "Iran", "Japon", "Jordanie", "Maroc", "Mexique", "Norvège", "Nouvelle-Zélande", "Ouzbékistan", "Panama", "Paraguay", "Pays-Bas", "Portugal", "Qatar", "RD Congo", "Rép. tchèque", "Suisse", "Suède", "Sénégal", "Tunisie", "Turquie", "Uruguay", "Écosse", "Égypte", "États-Unis"];

function isGroupStageOver() {
  // Vrai si tous les matchs de phase de groupes sont terminés
  const groupMatches = data.filter(m => String(m.phase||'').toLowerCase().includes('groupe'));
  if (!groupMatches.length) return false;
  return groupMatches.every(m => matchStatusKey(m) === 'finished');
}

async function selectTournamentWinner(team) {
  if (!currentUser || !currentProfile) return;
  if (currentProfile.tournament_winner_locked) return;
  try {
    await authFetch(`user_profiles?id=eq.${currentUser.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ tournament_winner_pick: team }),
    });
    currentProfile.tournament_winner_pick = team;
    renderChallenge();
  } catch(err) {
    console.warn('Erreur pronostic bonus', err);
  }
}

function renderBonusBlock() {
  if (!currentUser || !currentProfile) return '';
  const locked = currentProfile.tournament_winner_locked || isGroupStageOver();
  const pick = currentProfile.tournament_winner_pick || '';

  if (locked) {
    return `
      <div data-bonus-locked="true" style="background:linear-gradient(135deg,#2a1a4a,#1a0d2e);border:1px solid #c084fc44;border-radius:22px;padding:24px;margin-top:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:28px">🌟</span>
          <div style="font-size:18px;font-weight:950;background:linear-gradient(90deg,#c084fc,#ff6b9d);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Question Bonus — Vainqueur du tournoi</div>
        </div>
        <p style="color:#cbb8e8;font-size:14px;margin:0">
          ${pick ? `Ton choix : <b style="color:#fff">${esc(pick)}</b>` : 'Tu n\'as pas fait de pronostic.'}
          <br>Verrouillé — résultat à la fin du tournoi (+15 pts si correct).
        </p>
      </div>
    `;
  }

  return `
    <div data-bonus-locked="false" style="background:linear-gradient(135deg,#2a1a4a,#1a0d2e);border:1px solid #c084fc44;border-radius:22px;padding:24px;margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:28px">🌟</span>
          <div style="font-size:18px;font-weight:950;background:linear-gradient(90deg,#c084fc,#ff6b9d);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Question Bonus</div>
        </div>
        <span style="background:#c084fc22;border:1px solid #c084fc55;border-radius:99px;padding:5px 14px;font-size:13px;font-weight:950;color:#c084fc">+15 pts</span>
      </div>
      <p style="color:#cbb8e8;font-size:14px;margin:0 0 14px">Qui va remporter la Coupe du Monde 2026 ? Modifiable jusqu'à la fin des phases de groupes.</p>
      <select onchange="selectTournamentWinner(this.value)" style="display:block;width:100%;box-sizing:border-box;background:#020b16;border:1px solid #c084fc44;border-radius:14px;padding:14px 16px;color:#eaf5ff;font-size:15px;font-family:inherit;outline:none;cursor:pointer">
        <option value="">— Choisis ton favori —</option>
        ${WC26_TEAMS.map(t => `<option value="${esc(t)}" ${pick===t?'selected':''}>${flags[t]||'🏳️'} ${esc(t)}</option>`).join('')}
      </select>
      ${pick ? `<div style="margin-top:10px;color:#c084fc;font-size:13px;font-weight:700">✅ Pronostic actuel : ${esc(pick)}</div>` : ''}
    </div>
  `;
}

// ─── Historique des pronostics ─────────────────────────────────────────────

async function renderPredictionHistory() {
  if (!currentUser || !currentProfile) return '';
  let myPreds = [];
  try {
    myPreds = await authFetch(`match_predictions?user_id=eq.${currentUser.id}&select=match_id,choice,score_a_pick,score_b_pick,qualifier_pick`);
  } catch(_) { myPreds = []; }
  if (!myPreds || !myPreds.length) return '';

  // Déduplique par match (peut arriver s'il reste d'anciennes lignes en base
  // avant l'ajout de la contrainte unique côté Supabase) — garde la ligne
  // la plus complète (avec un score exact renseigné si possible).
  const byMatch = {};
  myPreds.forEach(p => {
    const key = String(p.match_id);
    const existing = byMatch[key];
    const hasScore = p.score_a_pick!=null && p.score_b_pick!=null;
    const existingHasScore = existing && existing.score_a_pick!=null && existing.score_b_pick!=null;
    if(!existing || (hasScore && !existingHasScore)){
      byMatch[key] = p;
    }
  });
  myPreds = Object.values(byMatch);

  const rows = myPreds.map(pred => {
    const m = data.find(x => String(x.id) === String(pred.match_id));
    if (!m) return null;
    const hasScore = pred.score_a_pick!=null && pred.score_b_pick!=null;
    // Label utilisé pour l'affichage (score exact si dispo, sinon le vainqueur choisi)
    const winnerLabel = pred.choice === 'home' ? m.home : pred.choice === 'away' ? m.away : pred.choice === 'draw' ? 'Match nul' : pred.choice;
    const displayLabel = hasScore ? `${m.home} ${pred.score_a_pick} - ${pred.score_b_pick} ${m.away}` : winnerLabel;
    const finished = matchStatusKey(m) === 'finished';
    let resultIcon = '⏳';
    let resultLabel = 'En attente';
    let pts = 0;
    if (finished) {
      const realResult = m.score_a > m.score_b ? m.home : m.score_a < m.score_b ? m.away : 'Match nul';
      const exactMatch = hasScore && m.score_a === pred.score_a_pick && m.score_b === pred.score_b_pick;
      if (exactMatch) {
        resultIcon = '✅';
        resultLabel = '+5 pts';
        pts = 5;
      } else if (winnerLabel === realResult) {
        resultIcon = '✅';
        resultLabel = '+3 pts';
        pts = 3;
      } else {
        resultIcon = '❌';
        resultLabel = '0 pt';
      }
    }
    return { m, choiceLabel: displayLabel, resultIcon, resultLabel, finished, pts, start: matchStart(m) };
  }).filter(Boolean).sort((a,b) => b.start - a.start);

  if (!rows.length) return '';

  const total = rows.length;
  const preview = rows.slice(0, 5);
  const rest = rows.slice(5);

  const rowHtml = r => `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#ffffff08;border:1px solid #ffffff14;border-radius:14px;margin-bottom:8px;flex-wrap:wrap">
      <div style="flex:1;min-width:140px">
        <div style="font-weight:800;font-size:14px">${flags[r.m.home]||'🏳️'} ${esc(r.m.home)} vs ${flags[r.m.away]||'🏳️'} ${esc(r.m.away)}</div>
        <div style="font-size:12px;color:#8fa6bd;margin-top:2px">Ton choix : <b style="color:#dcecff">${esc(r.choiceLabel)}</b></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:20px">${r.resultIcon}</div>
        <div style="font-size:12px;font-weight:800;color:${r.pts>0?'#ffd166':'#8fa6bd'}">${r.resultLabel}</div>
      </div>
    </div>
  `;

  const restHtml = rest.length ? `
    <div id="predHistoryExtra" style="display:none">
      ${rest.map(rowHtml).join('')}
    </div>
    <button onclick="togglePredHistory()" id="predHistoryBtn" style="display:block;width:100%;padding:12px;background:#ffffff0d;border:1px solid #ffffff18;color:#adc0d2;-webkit-text-fill-color:#adc0d2;border-radius:14px;font-weight:800;font-size:13px;cursor:pointer;font-family:inherit;margin-top:4px">
      Voir tous mes pronostics (${total}) ↓
    </button>
  ` : '';

  return `
    <div style="margin-top:16px;margin-bottom:16px">
      <h3 style="margin:0 0 12px">📜 Mes pronostics <span style="font-size:13px;font-weight:700;color:#8fa6bd">${total} au total</span></h3>
      ${preview.map(rowHtml).join('')}
      ${restHtml}
    </div>
  `;
}

function togglePredHistory() {
  const extra = document.getElementById('predHistoryExtra');
  const btn = document.getElementById('predHistoryBtn');
  if (!extra || !btn) return;
  const isHidden = extra.style.display === 'none';
  extra.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? 'Réduire ↑' : `Voir tous mes pronostics (${btn.textContent.match(/\d+/)?.[0] || ''}) ↓`;
}

// ─── Init ──────────────────────────────────────────────────────────────────

async function initAuth() {
  // Gère le retour du Magic Link
  await handleAuthCallback();

  // Charge l'utilisateur et son profil
  currentUser = await getUser();
  if (currentUser) {
    currentProfile = await loadProfile(currentUser.id);
    if (currentProfile) {
      await recalculateUserPoints(currentUser.id);
      currentProfile = await loadProfile(currentUser.id);
    }
  }

  await loadLeaderboard();
  renderChallenge();
  initNotifications();
}
