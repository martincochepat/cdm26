// Guide Mondial 2026 — sync API-Football -> Supabase
// V73 — Sync simple : appel API-Football à chaque cron (toutes les minutes)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body, null, 2));
}

function parisToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ").replace(/['']/g, " ")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

const TEAM_ALIASES = {
  "mexico": "mexico", "mexique": "mexico",
  "south africa": "south africa", "afrique du sud": "south africa",
  "usa": "united states", "u s a": "united states",
  "united states": "united states", "united states of america": "united states",
  "etats unis": "united states", "états unis": "united states",
  "canada": "canada", "france": "france",
  "germany": "germany", "allemagne": "germany",
  "spain": "spain", "espagne": "spain",
  "portugal": "portugal", "england": "england", "angleterre": "england",
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
  "republique tcheque": "czechia", "rep tcheque": "czechia",
  "brazil": "brazil", "bresil": "brazil", "brésil": "brazil",
  "argentina": "argentina", "argentine": "argentina",
  "uruguay": "uruguay", "colombia": "colombia", "colombie": "colombia",
  "ecuador": "ecuador", "equateur": "ecuador", "équateur": "ecuador",
  "paraguay": "paraguay", "chile": "chile", "chili": "chile",
  "peru": "peru", "perou": "peru", "pérou": "peru",
  "panama": "panama", "costa rica": "costa rica",
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
  "cape verde": "cape verde", "cabo verde": "cape verde", "cap vert": "cape verde",
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
  const ka = teamKey(a), kb = teamKey(b);
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
  return Math.abs((new Date(a + "T00:00:00Z") - new Date(b + "T00:00:00Z")) / 86400000);
}

function normalizeStatus(apiStatus) {
  const short = String(apiStatus?.short || "").toUpperCase();
  const long = String(apiStatus?.long || "").toLowerCase();
  if (["1H", "2H", "ET", "P", "BT", "LIVE", "HT"].includes(short)) return "live";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  if (["PST", "CANC", "ABD", "SUSP", "INT"].includes(short)) return long || "postponed";
  return "upcoming";
}

function getMinute(apiStatus) {
  const n = Number(apiStatus?.elapsed);
  return Number.isFinite(n) ? n : null;
}

function winnerFromFixture(fx, status) {
  if (status !== "finished") return null;
  const hg = fx?.goals?.home, ag = fx?.goals?.away;
  if (hg == null || ag == null) return null;
  if (Number(hg) > Number(ag)) return fx?.teams?.home?.name || "";
  if (Number(ag) > Number(hg)) return fx?.teams?.away?.name || "";
  // Score à égalité après prolongation : vérifier les tirs au but
  const penHome = fx?.score?.penalty?.home;
  const penAway = fx?.score?.penalty?.away;
  if (penHome != null && penAway != null) {
    if (Number(penHome) > Number(penAway)) return fx?.teams?.home?.name || "";
    if (Number(penAway) > Number(penHome)) return fx?.teams?.away?.name || "";
  }
  return "draw";
}

function penaltyScore(fx) {
  const penHome = fx?.score?.penalty?.home;
  const penAway = fx?.score?.penalty?.away;
  if (penHome == null || penAway == null) return { pen_a: null, pen_b: null };
  return { pen_a: Number(penHome), pen_b: Number(penAway) };
}

function fixtureToCandidate(fx) {
  const { date, time_fr } = toParisDateTime(fx?.fixture?.date);
  const status = normalizeStatus(fx?.fixture?.status);
  const home = fx?.teams?.home?.name || "";
  const away = fx?.teams?.away?.name || "";
  const { pen_a, pen_b } = penaltyScore(fx);
  return {
    api_fixture_id: fx?.fixture?.id ? String(fx.fixture.id) : null,
    date, time_fr, team_a: home, team_b: away,
    home_key: teamKey(home), away_key: teamKey(away),
    status, minute: getMinute(fx?.fixture?.status),
    score_a: fx?.goals?.home ?? null, score_b: fx?.goals?.away ?? null,
    pen_a, pen_b,
    winner: winnerFromFixture(fx, status),
  };
}

async function apiFootball(path) {
  const r = await fetch(`${API_FOOTBALL_BASE}${path}`, {
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
  const url = `${SUPABASE_URL}/rest/v1/matches?select=id,date,time_fr,team_a,team_b,phase,round,status,score_a,score_b,minute,winner,api_fixture_id&date=gte.2026-06-01&date=lte.2026-07-31`;
  const r = await fetch(url, {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase read matches error ${r.status}: ${text}`);
  return JSON.parse(text);
}

function isPlaceholder(name) {
  if (!name) return true;
  const n = String(name).toLowerCase();
  return (
    n.includes('groupe') || n.includes('group') ||
    n.includes('winner') || n.includes('loser') ||
    n.includes('1er') || n.includes('2ème') || n.includes('2eme') ||
    n.includes('vainqueur') || n.includes('perdant') ||
    n.match(/^[a-z]\d+$/) // ex: "A1", "B2"
  );
}

function findLocalMatch(apiMatch, localMatches) {
  const candidates = [];
  for (const m of localMatches) {
    const aIsPlaceholder = isPlaceholder(m.team_a);
    const bIsPlaceholder = isPlaceholder(m.team_b);
    const hasPlaceholders = aIsPlaceholder || bIsPlaceholder;

    if (hasPlaceholders) {
      // Pour les matchs de phase finale avec placeholders :
      // on matche uniquement sur la date (± 1 jour) et on évite de matcher
      // un slot déjà assigné à de vraies équipes
      const dd = dateDistanceDays(m.date, apiMatch.date);
      if (dd <= 1) {
        // Score élevé = peu prioritaire, on préfère les matchs sans placeholder
        candidates.push({ match: { ...m, _reversed: false, _wasPlaceholder: true }, score: 50 + dd * 10, dd });
      }
      continue;
    }

    // Matching normal pour les matchs de groupes (vraies équipes)
    const sameOrder = sameTeam(m.team_a, apiMatch.team_a) && sameTeam(m.team_b, apiMatch.team_b);
    const reversed = sameTeam(m.team_a, apiMatch.team_b) && sameTeam(m.team_b, apiMatch.team_a);
    if (!sameOrder && !reversed) continue;
    const dd = dateDistanceDays(m.date, apiMatch.date);
    let score = dd <= 1 ? 0 : dd <= 3 ? 25 : 80;
    if (reversed) score += 5;
    if (m.time_fr && apiMatch.time_fr && m.time_fr === apiMatch.time_fr) score -= 3;
    candidates.push({ match: { ...m, _reversed: reversed }, score, dd });
  }
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];
  return best && best.dd <= 3 ? best.match : null;
}

async function supabasePatchMatch(matchId, patch) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/matches?id=eq.${encodeURIComponent(matchId)}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json", Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`Supabase update match ${matchId} error ${r.status}: ${await r.text()}`);
}

function buildPatch(apiMatch, localMatch) {
  let { score_a, score_b, winner, team_a, team_b, pen_a, pen_b } = apiMatch;
  const wasPlaceholder = localMatch._wasPlaceholder;

  if (localMatch._reversed) {
    [score_a, score_b] = [score_b, score_a];
    [team_a, team_b] = [team_b, team_a];
    if (pen_a != null && pen_b != null) [pen_a, pen_b] = [pen_b, pen_a];
    if (winner === apiMatch.team_a) winner = localMatch.team_b;
    else if (winner === apiMatch.team_b) winner = localMatch.team_a;
  } else {
    if (winner === apiMatch.team_a) winner = wasPlaceholder ? apiMatch.team_a : localMatch.team_a;
    else if (winner === apiMatch.team_b) winner = wasPlaceholder ? apiMatch.team_b : localMatch.team_b;
  }

  const patch = {
    status: apiMatch.status,
    score_a,
    score_b,
    minute: apiMatch.minute,
    winner,
    api_fixture_id: apiMatch.api_fixture_id,
    updated_at: new Date().toISOString(),
  };

  // Tirs au but (uniquement si présents)
  if (pen_a != null && pen_b != null) {
    patch.pen_a = pen_a;
    patch.pen_b = pen_b;
  }

  // Si le slot avait des placeholders, on met à jour les noms des équipes
  if (wasPlaceholder) {
    patch.team_a = team_a;
    patch.team_b = team_b;
  }

  return patch;
}

async function syncEvents(apiMatch, localMatch, dryRun) {
  if (!apiMatch?.api_fixture_id) return { synced: false };
  // Ne synchronise les événements QUE pour les matchs réellement en direct
  // (évite 1 appel API-Football par match "du jour" même hors période de jeu)
  if (apiMatch.status !== "live") return { synced: false };
  try {
    const data = await apiFootball(`/fixtures/events?fixture=${encodeURIComponent(apiMatch.api_fixture_id)}`);
    const events = Array.isArray(data.response) ? data.response : [];
    const rows = events.map((event, index) => ({
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
      event_key: [apiMatch.api_fixture_id, index, event?.time?.elapsed ?? "", event?.time?.extra ?? "", event?.type, event?.detail, event?.team?.name, event?.player?.name].join("|"),
      updated_at: new Date().toISOString(),
    }));
    if (!dryRun) {
      await fetch(`${SUPABASE_URL}/rest/v1/match_events?api_fixture_id=eq.${encodeURIComponent(apiMatch.api_fixture_id)}`, {
        method: "DELETE",
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, Prefer: "return=minimal" },
      });
      if (rows.length) {
        await fetch(`${SUPABASE_URL}/rest/v1/match_events`, {
          method: "POST",
          headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify(rows),
        });
      }
    }
    return { synced: true, rows: rows.length };
  } catch (e) {
    return { synced: false, error: String(e.message) };
  }
}

async function sync({ dryRun = false } = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !API_FOOTBALL_KEY) {
    throw new Error("Missing env vars");
  }

  const [fixtures, localMatches] = await Promise.all([
    fetchWorldCupFixtures(),
    supabaseGetMatches(),
  ]);

  const apiMatches = fixtures.map(fixtureToCandidate).filter(m => m.date && m.team_a && m.team_b);
  const updates = [], unmatched = [], eventResults = [];
  const matched = new Set();

  for (const apiMatch of apiMatches) {
    const available = localMatches.filter(m => !matched.has(String(m.id)));
    const localMatch = findLocalMatch(apiMatch, available);
    if (!localMatch) { unmatched.push(`${apiMatch.team_a} vs ${apiMatch.team_b} (${apiMatch.date})`); continue; }
    matched.add(String(localMatch.id));
    const patch = buildPatch(apiMatch, localMatch);
    updates.push({ id: localMatch.id, local: `${localMatch.team_a} vs ${localMatch.team_b}`, patch });
    if (!dryRun) await supabasePatchMatch(localMatch.id, patch);
    const evResult = await syncEvents(apiMatch, localMatch, dryRun);
    if (evResult.synced) eventResults.push({ match: localMatch.team_a + ' vs ' + localMatch.team_b, rows: evResult.rows });
  }

  return {
    ok: true,
    version: "API-FOOTBALL-V74-KNOCKOUT",
    dryRun,
    api_fixtures_received: fixtures.length,
    updates_ready: updates.length,
    placeholder_slots_filled: updates.filter(u => u.patch.team_a).length,
    unmatched_count: unmatched.length,
    unmatched_sample: unmatched.slice(0, 5),
    events_synced: eventResults.length,
    sample_updates: updates.slice(0, 6),
    note: dryRun ? "Dry run." : `Sync complète — ${updates.length} matchs mis à jour.`,
  };
}

module.exports = async function handler(req, res) {
  try {
    if (process.env.CRON_SECRET && req.query.secret !== process.env.CRON_SECRET) {
      return json(res, 401, { ok: false, error: "Unauthorized" });
    }
    const dryRun = String(req.query.dryRun || "") === "1";
    const result = await sync({ dryRun });
    return json(res, 200, result);
  } catch (err) {
    return json(res, 500, { ok: false, version: "API-FOOTBALL-V73-SIMPLE", error: String(err.message || err) });
  }
};
