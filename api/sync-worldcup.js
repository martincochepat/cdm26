// Guide Mondial 2026 — sync API-Football -> Supabase
// V59 backend live. Server-side only on Vercel.
// Updates only live fields: status, score_a, score_b, minute, winner, updated_at.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

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
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function teamKey(name) {
  const n = normalizeText(name);

  const aliases = {
    "usa": "united states",
    "u s a": "united states",
    "united states of america": "united states",
    "etats unis": "united states",
    "états unis": "united states",

    "south korea": "korea republic",
    "republic of korea": "korea republic",
    "coree du sud": "korea republic",
    "corée du sud": "korea republic",

    "czech republic": "czechia",
    "republique tcheque": "czechia",
    "république tchèque": "czechia",

    "bosnia and herzegovina": "bosnia",
    "bosnie herzégovine": "bosnia",
    "bosnie herzegovine": "bosnia",

    "ivory coast": "cote d ivoire",
    "côte d ivoire": "cote d ivoire",

    "cape verde": "cap vert",
    "cabo verde": "cap vert",

    "dr congo": "congo dr",
    "democratic republic of congo": "congo dr",
    "rd congo": "congo dr",

    "uae": "united arab emirates",
    "emirats arabes unis": "united arab emirates",
    "émirats arabes unis": "united arab emirates",
  };

  return aliases[n] || n;
}

function toParisDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: null, time_fr: null };

  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

  const time_fr = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  return { date, time_fr };
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
    date,
    time_fr,
    team_a: home,
    team_b: away,
    home_key: teamKey(home),
    away_key: teamKey(away),
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
  if (!r.ok) {
    throw new Error(`API-Football error ${r.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function fetchWorldCupFixtures() {
  const data = await apiFootball("/fixtures?league=1&season=2026");
  return Array.isArray(data.response) ? data.response : [];
}

async function supabaseGetMatches() {
  const url =
    `${SUPABASE_URL}/rest/v1/matches` +
    `?select=id,date,time_fr,team_a,team_b,status,score_a,score_b,minute,winner` +
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
  // 1) Strict: same Paris date + same home/away names normalized.
  let found = localMatches.find((m) =>
    m.date === apiMatch.date &&
    teamKey(m.team_a) === apiMatch.home_key &&
    teamKey(m.team_b) === apiMatch.away_key
  );
  if (found) return found;

  // 2) Same date + reversed names, just in case.
  found = localMatches.find((m) =>
    m.date === apiMatch.date &&
    teamKey(m.team_a) === apiMatch.away_key &&
    teamKey(m.team_b) === apiMatch.home_key
  );
  if (found) {
    return { ...found, _reversed: true };
  }

  // 3) Fallback: same teams regardless of date.
  found = localMatches.find((m) =>
    teamKey(m.team_a) === apiMatch.home_key &&
    teamKey(m.team_b) === apiMatch.away_key
  );
  if (found) return found;

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

function buildPatch(apiMatch, localMatch) {
  let score_a = apiMatch.score_a;
  let score_b = apiMatch.score_b;
  let winner = apiMatch.winner;

  // If local match is reversed compared with API, swap scores.
  if (localMatch._reversed) {
    score_a = apiMatch.score_b;
    score_b = apiMatch.score_a;

    if (apiMatch.winner === apiMatch.team_a) winner = apiMatch.team_b;
    else if (apiMatch.winner === apiMatch.team_b) winner = apiMatch.team_a;
  }

  return {
    status: apiMatch.status,
    score_a,
    score_b,
    minute: apiMatch.minute,
    winner,
    updated_at: new Date().toISOString(),
  };
}

async function sync({ dryRun = false } = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !API_FOOTBALL_KEY) {
    throw new Error(
      "Missing env vars. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, API_FOOTBALL_KEY"
    );
  }

  const fixtures = await fetchWorldCupFixtures();
  const apiMatches = fixtures.map(fixtureToCandidate).filter((m) => m.date && m.team_a && m.team_b);
  const localMatches = await supabaseGetMatches();

  const updates = [];
  const unmatched = [];

  for (const apiMatch of apiMatches) {
    const localMatch = findLocalMatch(apiMatch, localMatches);

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

    const patch = buildPatch(apiMatch, localMatch);

    updates.push({
      id: localMatch.id,
      local: `${localMatch.team_a} vs ${localMatch.team_b}`,
      api: `${apiMatch.team_a} vs ${apiMatch.team_b}`,
      date: apiMatch.date,
      patch,
    });

    if (!dryRun) {
      await supabasePatchMatch(localMatch.id, patch);
    }
  }

  return {
    ok: true,
    dryRun,
    api_fixtures_received: fixtures.length,
    api_matches_usable: apiMatches.length,
    local_matches_loaded: localMatches.length,
    updates_ready: updates.length,
    unmatched_count: unmatched.length,
    sample_updates: updates.slice(0, 10),
    sample_unmatched: unmatched.slice(0, 10),
    note: dryRun
      ? "Dry run uniquement : aucune donnée Supabase modifiée."
      : "Synchronisation terminée : Supabase a été mise à jour.",
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
    return json(res, 500, {
      ok: false,
      error: String(err.message || err),
    });
  }
};
