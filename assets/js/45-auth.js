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
  const headers = Object.assign({
    apikey: AUTH_SUPABASE_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }, options.headers || {});
  const res = await fetch(`${AUTH_SUPABASE_URL}/rest/v1/${path}`, Object.assign({ headers, cache: 'no-store' }, options));
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

async function getSession() {
  try {
    const raw = localStorage.getItem('sb-lclnnxirkuuwexxcmmho-auth-token');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Vérifie expiration
    if (parsed?.expires_at && Date.now() / 1000 > parsed.expires_at) return null;
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
    const preds = await authFetch(`match_predictions?user_id=eq.${userId}&select=match_id,choice`);
    if (!preds || !preds.length) return;

    let points = 0;
    let correct = 0;
    let total = preds.length;

    for (const pred of preds) {
      const match = data.find(m => String(m.id) === String(pred.match_id));
      if (!match || match.status !== 'finished') continue;

      const opts = pollOptionsFor(match); // [home, 'Nul', away]
      const realResult = match.score_a > match.score_b ? opts[0]
        : match.score_a < match.score_b ? opts[2]
        : opts[1];

      if (pred.choice === realResult) {
        points += 3;
        correct++;
      }
    }

    // Points quiz
    const quizAnswers = await authFetch(`user_quiz_answers?user_id=eq.${userId}&select=points_earned`);
    const quizPoints = (quizAnswers || []).reduce((sum, r) => sum + (r.points_earned || 0), 0);
    const quizCorrect = (quizAnswers || []).filter(r => r.points_earned > 0).length;

    points += quizPoints;

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

function renderChallenge() {
  const box = document.getElementById('challengeBox');
  if (!box) return;

  const myRank = currentProfile
    ? leaderboardRows.findIndex(r => r.pseudo === currentProfile.pseudo) + 1
    : 0;

  box.innerHTML = `
    ${renderAuthBlock(myRank)}
    ${renderLeaderboard(myRank)}
  `;
}

function renderAuthBlock(myRank) {
  if (!currentUser) {
    return `
      <div class="challenge-hero">
        <div class="challenge-top-row">
          <div>
            <div class="challenge-headline">🔥 Qui pronostique le mieux ?</div>
            <p class="challenge-sub">Vote sur chaque match, réponds au quiz du jour.<br>Les points tombent dès que les résultats sont officiels.</p>
          </div>
          <div class="challenge-pills">
            <div class="challenge-pill">✅ Vainqueur<b>+3 pts</b></div>
            <div class="challenge-pill">🎯 Score exact<b>+5 pts</b></div>
            <div class="challenge-pill">🧠 Quiz<b>+2 pts</b></div>
          </div>
        </div>
        <button class="challenge-join-btn" onclick="openAuthModal()">
          🏆 Rejoindre le classement — inscription gratuite en 10 sec
        </button>
      </div>
      <!-- Modale inscription -->
      <div id="authModal" class="auth-modal" style="display:none" onclick="if(event.target.id==='authModal')closeAuthModal()">
        <div class="auth-modal-card">
          <button class="auth-modal-close" onclick="closeAuthModal()">✕</button>
          <div id="authStep1" class="auth-step">
            <div class="auth-modal-icon">🏆</div>
            <h2 class="auth-modal-title">Rejoins le classement</h2>
            <p class="auth-modal-sub">Entre ton email — on t'envoie un lien magique pour te connecter. Pas de mot de passe.</p>
            <input id="magicEmail" type="email" placeholder="ton@email.fr" autocomplete="email" class="auth-input">
            <button class="auth-btn-primary" onclick="handleMagicLink()">Envoyer le lien →</button>
            <div id="magicStatus" class="magic-status"></div>
          </div>
          <div id="authStep2" class="auth-step" style="display:none">
            <div class="auth-modal-icon">📬</div>
            <h2 class="auth-modal-title">Check tes mails !</h2>
            <p class="auth-modal-sub">Un lien vient d'être envoyé à <b id="sentEmailDisplay"></b><br>Clique dessus pour te connecter automatiquement.</p>
            <p class="auth-modal-hint">Tu n'as pas reçu le mail ? Vérifie tes spams ou <button class="auth-link-btn" onclick="showStep(1)">réessaie</button>.</p>
          </div>
        </div>
      </div>
    `;
  }

  if (!currentProfile) {
    return `
      <div class="challenge-hero">
        <div class="challenge-headline">👋 Dernière étape !</div>
        <p class="challenge-sub">Connecté avec <b>${esc(currentUser.email)}</b><br>Choisis ton avatar et ton pseudo pour apparaître dans le classement.</p>
        <div class="auth-pseudo-form">
          <div class="emoji-picker">
            ${['⚽','🏆','🔥','⚡','🦁','🦅','🐺','🎯','🌟','💪'].map(e =>
              `<button class="emoji-btn" onclick="selectEmoji('${e}')" id="emoji-${e}">${e}</button>`
            ).join('')}
          </div>
          <input id="pseudoInput" type="text" class="auth-input" placeholder="Choisis ton pseudo (ex: MartinC)" maxlength="20" autocomplete="off">
          <button class="auth-btn-primary" onclick="handleCreateProfile()">C'est parti ! →</button>
        </div>
        <div id="pseudoStatus" class="magic-status"></div>
        <button class="challenge-logout" onclick="signOut()">Se déconnecter</button>
      </div>
    `;
  }

  return `
    <div class="challenge-hero connected">
      <div class="challenge-user-row">
        <span class="challenge-avatar">${esc(currentProfile.avatar_emoji)}</span>
        <div>
          <div class="challenge-headline" style="margin:0">${esc(currentProfile.pseudo)}</div>
          <div class="challenge-stats-row">
            ${myRank ? `<span class="challenge-badge">🏅 #${myRank}</span>` : ''}
            <span class="challenge-badge">${currentProfile.points} pts</span>
            <span class="challenge-badge">${currentProfile.predictions_correct}/${currentProfile.predictions_total} pronostics</span>
            <span class="challenge-badge">${currentProfile.quiz_correct} quiz ✓</span>
          </div>
        </div>
      </div>
      <button class="challenge-logout" onclick="signOut()">Se déconnecter</button>
    </div>
  `;
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
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
      <div class="lb-row ${isMe ? 'lb-me' : ''}">
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
    <div class="challenge-leaderboard">
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
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`emoji-${e}`);
  if (btn) btn.classList.add('active');
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
    showStep(2);
  } catch (err) {
    if (status) status.innerHTML = `<span class="err">Erreur : ${esc(err.message)}</span>`;
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
  } catch (err) {
    const msg = err.message.includes('unique') ? 'Ce pseudo est déjà pris, choisis-en un autre.' : err.message;
    if (status) status.innerHTML = `<span class="err">${esc(msg)}</span>`;
  }
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
}
