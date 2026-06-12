// Guide Mondial 2026 — sync API-Football -> Supabase
// V72 — Sync intelligent : live 30s, bientôt 3min, idle 10min
// Server-side only on Vercel (cron toutes les minutes, logique interne adaptative)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

// ─── Logique adaptative ────────────────────────────────────────────────────────
// Le cron Vercel tourne toutes les minutes (vercel.json).
// Cette fonction décide si on doit vraiment appeler API-Football ce tour-ci.
// → Match en direct   : on passe 1 fois sur 2 (≈ 30s entre vrais appels)
// → Match dans 2h     : on passe 1 fois sur 3 (≈ 3min entre vrais appels)
// → Aucun match proche: on passe 1 fois sur 10 (≈ 10min entre vrais appels)
// La "mémoire" est stockée dans Supabase pour survivre entre les invocations.

const SYNC_STATE_KEY = "sync_adaptive_state";

function parisNow() {
  return new Date(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).format(new Date()).replace(",", "")
  );
}

function parisToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

// Récupère l'état adaptatif depuis Supabase (table matches sert de pivot,
// on utilise une ligne spéciale dans live_match_state avec match_id='__sync__')
async function getSyncState() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/live_match_state?match_id=eq.__sync__&select=*`;
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const rows = await r.json();
    if (rows && rows[0] && rows[0].status) {
      return JSON.parse(rows[0].status);
    }
  } catch (_) {}
  return { tick: 0, lastSync: null, mode: "idle" };
}

async function saveSyncState(state) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/live_match_state?match_id=eq.__sync__`;
    // Essai PATCH d'abord
    const r = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ status: JSON.stringify(state), updated_at: new Date().toISOString() }),
    });
    // Si pas de ligne, on insère
    if (r.status === 404 || r.headers.get("content-range") === "*/0") {
      await fetch(`${SUPABASE_URL}/rest/v1/live_match_state`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          match_id: "__sync__",
          status: JSON.stringify(state),
          updated_at: new Date().toISOString(),
        }),
      });
    }
  } catch (_) {}
}

// Détermine le mode selon les matchs du jour
function detectMode(localMatches) {
  const now = new Date();
  const today = parisToday();

  const todayMatches = localMatches.filter(m => m.date === today);

  // Match en direct = commencé depuis moins de 130 min et pas finished
  const hasLive = todayMatches.some(m => {
    if (m.status === "live") return true;
    if (m.status === "finished") return false;
    const start = new Date(`${m.date}T${m.time_fr}:00+02:00`);
    const diff = (now - start) / 60000;
    return diff >= 0 && diff <= 130;
  });

  if (hasLive) return "live";

  // Match dans les 2 prochaines heures
  const hasSoon = todayMatches.some(m => {
    if (m.status === "finished") return false;
    const start = new Date(`${m.date}T${m.time_fr}:00+02:00`);
    const diffMin = (start - now) / 60000;
    return diffMin >= 0 && diffMin <= 120;
  });

  if (hasSoon) return "soon";

  return "idle";
}

// Faut-il vraiment syncer ce tour-ci ?
function shouldRunThisTick(mode, tick) {
  if (mode === "live") return tick % 2 === 0;   // 1 sur 2 → ~30s
  if (mode === "soon") return tick % 3 === 0;   // 1 sur 3 → ~3min
  return tick % 10 === 0;                        // 1 sur 10 → ~10min
}

// ─── Utilitaires (identiques à V71) ───────────────────────────────────────────

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body, null, 2));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TEAM_ALIASES = {
  "mexico": "mexico", "mexique": "mexico",
  "south africa": "south africa", "afrique du sud": "south africa",
  "usa": "united states", "u s a": "united states",
  "united states": "united states", "united states of america": "united states",
  "etats unis": "united states", "états unis": "united states",
  "canada": "canada",
  "france": "france",
  "germany": "germany", "allemagne": "germany",
  "spain": "spain", "espagne": "spain",
  "portugal": "portugal",
  "england": "england", "angleterre": "england",
  "netherlands": "netherlands", "pays bas": "netherlands",
  "italy": "italy", "italie": "italy",
  "belgium": "belgium", "belgique": "belgium",
  "croatia": "croatia", "croatie": "croatia",
  "denmark": "denmark", "danemark": "denmark",
  "switzerland": "switzerland", "suisse": "switzerland",
  "sweden": "sweden", "suede": "sweden", "suède": "sweden",
  "norway": "norway", "norvege": "norway", "norvège": "norway",
  "scotland": "scotland", "ecosse": "scotland", "écosse": "scotland",
  "poland": "poland", "pologne": "poland",
  "austria": "austria", "autriche": "austria",
  "serbia": "serbia", "serbie": "serbia",
  "turkiye": "turkiye", "turkey": "turkiye", "turquie": "turkiye",
  "czech republic": "czechia", "czechia": "czechia",
  "republique tcheque": "czechia", "république tchèque": "czechia",
  "rep tcheque": "czechia", "rep tchèque": "czechia",
  "brazil": "brazil", "bresil": "brazil", "brésil": "brazil",
  "argentina": "argentina", "argentine": "argentina",
  "uruguay": "uruguay",
  "colombia": "colombia", "colombie": "colombia",
  "ecuador": "ecuador", "equateur": "ecuador", "équateur": "ecuador",
  "paraguay": "paraguay",
  "chile": "chile", "chili": "chile",
  "peru": "peru", "perou": "peru", "pérou": "peru",
  "panama": "panama",
  "costa rica": "costa rica",
  "haiti": "haiti", "haïti": "haiti",
  "curacao": "curacao", "curaçao": "curacao",
  "jamaica": "jamaica", "jamaique": "jamaica", "jamaïque": "jamaica",
  "morocco": "morocco", "maroc": "morocco",
  "senegal": "senegal", "sénégal": "senegal",
  "bosnia and herzegovina": "bosnia and herzegovina",
  "bosnia herzegovina": "bosnia and herzegovina",
  "bosnie herzegovine": "bosnia and herzegovina",
  "bosnie herzégovine": "bosnia and herzegovina",
  "tunisia": "tunisia", "tunisie": "tunisia",
  "ghana": "ghana", "nigeria": "nigeria",
  "egypt": "egypt", "egypte": "egypt", "égypte": "egypt",
  "algeria": "algeria", "algerie": "algeria", "algérie": "algeria",
  "ivory coast": "ivory coast",
  "cote d ivoire": "ivory coast", "côte d ivoire": "ivory coast",
  "cameroon": "cameroon", "cameroun": "cameroon",
  "congo dr": "congo dr", "dr congo": "congo dr", "rd congo": "congo dr",
  "democratic republic of congo": "congo dr",
  "republique democratique du congo": "congo dr",
  "cape verde": "cape verde", "cabo verde": "cape verde",
  "cap vert": "cape verde",
  "japan": "japan", "japon": "japan",
  "south korea": "south korea", "korea republic": "south korea",
  "coree du sud": "south korea", "corée du sud": "south korea",
  "australia": "australia", "australie": "australia",
  "iran": "iran", "qatar": "qatar",
  "saudi arabia": "saudi arabia", "arabie saoudite": "saudi arabia",
  "iraq": "iraq", "irak": "iraq",
  "uzbekistan": "uzbekistan", "ouzbekistan": "uzbekistan",
  "new zealand": "new zealand",
  "nouvelle zelande": "new zealand", "nouvelle zélande": "new zealand",
  "jordan": "jordan", "jordanie": "jordan",
};

function teamKey(name) {
  const n = normalizeText(name);
  return TEAM_ALIASES[n] || n;
}

function sameTeam(a, b) {
  const ka = teamKey(a);
  const kb = teamKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  return ka.includes(kb) || kb.includes(ka);
}

function toParisDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: null, time_fr: null };
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
  const time_fr = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(d);
  return { date, time_fr };
}

function dateDistanceDays(a, b) {
  if (!a || !b) return 999;
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.abs((da - db) / 86400000);
}

function normalizeStatus(apiStatus) {
  const short = String(apiStatus?.short || "").toUpperCase();
  const long = String(apiStatus?.long || "").toLowerCase();
  if (["1H", "2H", "ET", "P", "BT", "LIVE"].includes(short)) return "live";
  if (short === "HT") return "live";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  if (["PST", "CANC", "ABD", "SUSP", "INT"].includes(short)) return long || "postponed";
  return "upcoming";
}

function getMinute(apiStatus) {
  const elapsed = apiStatus?.elapsed;
  if (elapsed === null || elapsed === undefined) return null;
  const n = Number(elapsed);
  return Number.isFinite(n) ? n : null;
}

function winnerFromFixture(fx, status) {
  if (status !== "finished") return null;
  const home = fx?.teams?.home?.name || "";
  const away = fx?.teams?.away?.name || "";
  const hg = fx?.goals?.home;
  const ag = fx?.goals?.away;
  if (hg === null || hg === undefined || ag === null || ag === undefined) return null;
  if (Number(hg) > Number(ag)) return home;
  if (Number(ag) > Number(hg)) return away;
  return "draw";
}

function fixtureToCandidate(fx) {
  const { date, time_fr } = toParisDateTime(fx?.fixture?.date);
  const status = normalizeStatus(fx?.fixture?.status);
  const home = fx?.teams?.home?.name || "";
  const away = fx?.teams?.away?.name || "";
  return {
    api_fixture_id: fx?.fixture?.id ? String(fx.fixture.id) : null,
    date, time_fr,
    team_a: home, team_b: away,
    home_key: teamKey(home), away_key: teamKey(away),
    status,
    minute: getMinute(fx?.fixture?.status),
    score_a: fx?.goals?.home ?? null,
    score_b: fx?.goals?.away ?? null,
    winner: winnerFromFixture(fx, status),
    api_status: fx?.fixture?.status || null,
  };
}

async function apiFootball(path) {
  const url = `${API_FOOTBALL_BASE}${path}`;
  const r = await fetch(url, {
    headers: { "x-apisports-key": API_FOOTBALL_KEY },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`API-Football error ${r.status}: ${JSON.stringify(data)}`);
  return data;
}

async function fetchWorldCupFixtures() {
  const data = await apiFootball("/fixtures?league=1&season=2026");
  return Array.isArray(data.response) ? data.response : [];
}

async function supabaseGetMatches() {
  const url =
    `${SUPABASE_URL}/rest/v1/matches` +
    `?select=id,date,time_fr,team_a,team_b,status,score_a,score_b,minute,winner,api_fixture_id` +
    `&date=gte.2026-06-01&date=lte.2026-07-31`;
  const r = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase read matches error ${r.status}: ${text}`);
  return JSON.parse(text);
}

function findLocalMatch(apiMatch, localMatches) {
  const candidates = [];
  for (const m of localMatches) {
    const sameOrder = sameTeam(m.team_a, apiMatch.team_a) && sameTeam(m.team_b, apiMatch.team_b);
    const reversed = sameTeam(m.team_a, apiMatch.team_b) && sameTeam(m.team_b, apiMatch.team_a);
    if (!sameOrder && !reversed) continue;
    const dd = dateDistanceDays(m.date, apiMatch.date);
    let score = 0;
    if (m.date === apiMatch.date) score += 0;
    else if (dd <= 1) score += 10;
    else if (dd <= 3) score += 25;
    else score += 80;
    if (reversed) score += 5;
    if (m.time_fr && apiMatch.time_fr && m.time_fr === apiMatch.time_fr) score -= 3;
    candidates.push({ match: { ...m, _reversed: reversed }, score, dd });
  }
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];
  if (best && best.dd <= 3) return best.match;
  return null;
}

async function supabasePatchMatch(matchId, patch) {
  const url = `${SUPABASE_URL}/rest/v1/matches?id=eq.${encodeURIComponent(matchId)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase update match ${matchId} error ${r.status}: ${text}`);
}

function shouldSyncEvents(apiMatch) {
  if (!apiMatch?.api_fixture_id) return false;
  if (apiMatch.status === "live") return true;
  return apiMatch.date === parisToday();
}

async function fetchFixtureEvents(apiFixtureId) {
  const data = await apiFootball(`/fixtures/events?fixture=${encodeURIComponent(apiFixtureId)}`);
  return Array.isArray(data.response) ? data.response : [];
}

function eventRowFromApi(event, apiMatch, localMatch, index) {
  return {
    match_id: String(localMatch.id),
    api_fixture_id: String(apiMatch.api_fixture_id),
    event_index: index,
    elapsed: event?.time?.elapsed ?? null,
    extra: event?.time?.extra ?? null,
    team_name: event?.team?.name || "",
    player_name: event?.player?.name || "",
    assist_name: event?.assist?.name || "",
    event_type: event?.type || "",
    detail: event?.detail || "",
    comments: event?.comments || "",
    event_key: [apiMatch.api_fixture_id, index, event?.time?.elapsed ?? "", event?.time?.extra ?? "", event?.type, event?.detail, event?.team?.name, event?.player?.name, event?.assist?.name].join("|"),
    updated_at: new Date().toISOString(),
  };
}

async function supabaseDeleteEventsForFixture(apiFixtureId) {
  const url = `${SUPABASE_URL}/rest/v1/match_events?api_fixture_id=eq.${encodeURIComponent(apiFixtureId)}`;
  const r = await fetch(url, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal",
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase delete events ${apiFixtureId} error ${r.status}: ${text}`);
}

async function supabaseInsertEvents(rows) {
  if (!rows.length) return;
  const url = `${SUPABASE_URL}/rest/v1/match_events`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase insert events error ${r.status}: ${text}`);
}

function buildPatch(apiMatch, localMatch) {
  let score_a = apiMatch.score_a;
  let score_b = apiMatch.score_b;
  let winner = apiMatch.winner;
  if (localMatch._reversed) {
    score_a = apiMatch.score_b;
    score_b = apiMatch.score_a;
    if (apiMatch.winner === apiMatch.team_a) winner = localMatch.team_b;
    else if (apiMatch.winner === apiMatch.team_b) winner = localMatch.team_a;
  } else {
    if (apiMatch.winner === apiMatch.team_a) winner = localMatch.team_a;
    else if (apiMatch.winner === apiMatch.team_b) winner = localMatch.team_b;
  }
  return {
    status: apiMatch.status,
    score_a, score_b,
    minute: apiMatch.minute,
    winner,
    api_fixture_id: apiMatch.api_fixture_id,
    updated_at: new Date().toISOString(),
  };
}

// ─── Fonction principale ───────────────────────────────────────────────────────

async function sync({ dryRun = false, forceRun = false } = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !API_FOOTBALL_KEY) {
    throw new Error("Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, API_FOOTBALL_KEY");
  }

  // 1. Charger les matchs Supabase (toujours, pour détecter le mode)
  const localMatches = await supabaseGetMatches();

  // 2. Détecter le mode actuel
  const mode = detectMode(localMatches);

  // 3. Lire l'état du tick adaptatif
  const state = await getSyncState();
  const newTick = (state.tick || 0) + 1;

  // 4. Décider si on appelle vraiment API-Football ce tour
  const doSync = forceRun || dryRun || shouldRunThisTick(mode, newTick);

  // Sauvegarder le nouveau tick dans tous les cas
  await saveSyncState({ tick: newTick, lastSync: doSync ? new Date().toISOString() : state.lastSync, mode });

  if (!doSync) {
    return {
      ok: true,
      version: "API-FOOTBALL-V72-ADAPTIVE",
      skipped: true,
      mode,
      tick: newTick,
      note: `Mode ${mode} : tick ignoré pour économiser les appels API. Prochain appel au tick ${newTick % (mode === 'live' ? 2 : mode === 'soon' ? 3 : 10) === 0 ? 'suivant' : (mode === 'live' ? 2 : mode === 'soon' ? 3 : 10) - (newTick % (mode === 'live' ? 2 : mode === 'soon' ? 3 : 10)) + ' ticks'}.`,
    };
  }

  // 5. Vraie sync API-Football
  const fixtures = await fetchWorldCupFixtures();
  const apiMatches = fixtures.map(fixtureToCandidate).filter((m) => m.date && m.team_a && m.team_b);

  const updates = [];
  const unmatched = [];
  const eventCandidates = [];
  const alreadyMatchedLocalIds = new Set();

  for (const apiMatch of apiMatches) {
    const availableLocalMatches = localMatches.filter(m => !alreadyMatchedLocalIds.has(String(m.id)));
    const localMatch = findLocalMatch(apiMatch, availableLocalMatches);

    if (!localMatch) {
      unmatched.push({
        date: apiMatch.date,
        time_fr: apiMatch.time_fr,
        api: `${apiMatch.team_a} vs ${apiMatch.team_b}`,
        status: apiMatch.status,
        score: `${apiMatch.score_a ?? "-"}-${apiMatch.score_b ?? "-"}`,
      });
      continue;
    }

    alreadyMatchedLocalIds.add(String(localMatch.id));
    const patch = buildPatch(apiMatch, localMatch);

    if (shouldSyncEvents(apiMatch)) {
      eventCandidates.push({ apiMatch, localMatch });
    }

    updates.push({
      id: localMatch.id,
      local: `${localMatch.team_a} vs ${localMatch.team_b}`,
      api: `${apiMatch.team_a} vs ${apiMatch.team_b}`,
      date_local: localMatch.date,
      date_api: apiMatch.date,
      reversed: !!localMatch._reversed,
      patch,
    });

    if (!dryRun) {
      await supabasePatchMatch(localMatch.id, patch);
    }
  }

  let eventsFixturesSynced = 0;
  let eventsRowsReady = 0;
  const eventErrors = [];

  for (const item of eventCandidates) {
    try {
      const events = await fetchFixtureEvents(item.apiMatch.api_fixture_id);
      const rows = events.map((event, index) => eventRowFromApi(event, item.apiMatch, item.localMatch, index));
      eventsFixturesSynced += 1;
      eventsRowsReady += rows.length;
      if (!dryRun) {
        await supabaseDeleteEventsForFixture(item.apiMatch.api_fixture_id);
        await supabaseInsertEvents(rows);
      }
    } catch (eventErr) {
      eventErrors.push({
        fixture: item.apiMatch.api_fixture_id,
        match: `${item.localMatch.team_a} vs ${item.localMatch.team_b}`,
        error: String(eventErr.message || eventErr),
      });
    }
  }

  return {
    ok: true,
    version: "API-FOOTBALL-V72-ADAPTIVE",
    dryRun,
    mode,
    tick: newTick,
    api_fixtures_received: fixtures.length,
    api_matches_usable: apiMatches.length,
    local_matches_loaded: localMatches.length,
    updates_ready: updates.length,
    unmatched_count: unmatched.length,
    event_fixtures_ready: eventCandidates.length,
    event_fixtures_synced: eventsFixturesSynced,
    event_rows_ready: eventsRowsReady,
    event_errors_count: eventErrors.length,
    sample_event_errors: eventErrors.slice(0, 5),
    sample_updates: updates.slice(0, 12),
    sample_unmatched: unmatched.slice(0, 20),
    note: dryRun
      ? "Dry run uniquement : aucune donnée Supabase modifiée."
      : `Sync effectuée (mode: ${mode}). Supabase mis à jour.`,
  };
}

module.exports = async function handler(req, res) {
  try {
    if (process.env.CRON_SECRET && req.query.secret !== process.env.CRON_SECRET) {
      return json(res, 401, { ok: false, error: "Unauthorized" });
    }
    const dryRun = String(req.query.dryRun || "") === "1";
    const forceRun = String(req.query.force || "") === "1";
    const result = await sync({ dryRun, forceRun });
    return json(res, 200, result);
  } catch (err) {
    return json(res, 500, {
      ok: false,
      version: "API-FOOTBALL-V72-ADAPTIVE",
      error: String(err.message || err),
    });
  }
};
