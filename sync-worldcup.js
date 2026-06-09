// Guide Mondial 2026 — sync SportMonks -> Supabase
// V34 backend live. This file runs server-side on Vercel.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

const SPORTMONKS_BASE = 'https://api.sportmonks.com/v3/football';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body, null, 2));
}

function toParisDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: null, time_fr: null };
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(d);
  const time_fr = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(d);
  return { date, time_fr };
}

function normalizeStatus(fixture) {
  const state = fixture?.state || {};
  const raw = String(state.short_name || state.name || fixture.state_id || '').toLowerCase();

  if (['live', '1st half', '2nd half', 'half-time', 'et', 'extra time', 'penalties', 'inplay', 'in play'].some(s => raw.includes(s))) return 'live';
  if (['ft', 'finished', 'ended', 'after penalties', 'aet', 'fulltime'].some(s => raw.includes(s))) return 'finished';
  if (['postponed', 'cancelled', 'canceled', 'abandoned', 'suspended'].some(s => raw.includes(s))) return raw;
  return 'upcoming';
}

function getParticipantName(fixture, location) {
  const p = (fixture.participants || []).find(x => String(x?.meta?.location || '').toLowerCase() === location);
  return p?.name || p?.short_code || null;
}

function getParticipantId(fixture, location) {
  const p = (fixture.participants || []).find(x => String(x?.meta?.location || '').toLowerCase() === location);
  return p?.id || null;
}

function getScore(fixture, participantId) {
  if (!participantId || !Array.isArray(fixture.scores)) return null;

  // Prefer CURRENT if present, otherwise latest-like descriptions.
  const preferred = ['CURRENT', '2ND_HALF', '1ST_HALF', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'];
  for (const desc of preferred) {
    const row = fixture.scores.find(s =>
      s.participant_id === participantId && String(s.description || '').toUpperCase() === desc
    );
    const goals = row?.score?.goals;
    if (goals !== undefined && goals !== null) return Number(goals);
  }

  const any = fixture.scores.find(s => s.participant_id === participantId && s?.score?.goals !== undefined);
  return any ? Number(any.score.goals) : null;
}

function getMinute(fixture) {
  if (fixture?.periods && Array.isArray(fixture.periods) && fixture.periods.length) {
    const last = fixture.periods[fixture.periods.length - 1];
    if (last?.minutes) return Number(last.minutes);
  }
  if (fixture?.metadata?.minute) return Number(fixture.metadata.minute);
  if (fixture?.time?.minute) return Number(fixture.time.minute);
  return null;
}

function mapFixtureToMatch(fixture) {
  const home = getParticipantName(fixture, 'home') || 'Équipe domicile';
  const away = getParticipantName(fixture, 'away') || 'Équipe extérieur';
  const homeId = getParticipantId(fixture, 'home');
  const awayId = getParticipantId(fixture, 'away');
  const { date, time_fr } = toParisDateTime(fixture.starting_at || fixture.starting_at_timestamp || fixture.starting_at_date);
  const status = normalizeStatus(fixture);
  const city = fixture?.venue?.city_name || fixture?.venue?.city || '';
  const stadium = fixture?.venue?.name || '';
  const score_a = getScore(fixture, homeId);
  const score_b = getScore(fixture, awayId);

  let winner = null;
  if (status === 'finished' && score_a !== null && score_b !== null) {
    winner = score_a > score_b ? home : score_b > score_a ? away : 'draw';
  }

  return {
    id: `sm-${fixture.id}`,
    sportmonks_id: String(fixture.id),
    date,
    time_fr,
    team_a: home,
    team_b: away,
    flag_a: '',
    flag_b: '',
    group_name: fixture?.group?.name || fixture?.stage?.name || fixture?.round?.name || '',
    phase: fixture?.stage?.name || fixture?.round?.name || '',
    stadium,
    city,
    country: fixture?.venue?.country?.name || '',
    channel: '',
    free_tv: false,
    status,
    minute: getMinute(fixture),
    score_a,
    score_b,
    winner,
    updated_at: new Date().toISOString()
  };
}

async function supabaseUpsert(table, rows, conflictTarget) {
  if (!rows.length) return { count: 0 };
  const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictTarget)}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(rows)
  });
  if (!r.ok) {
    throw new Error(`Supabase ${table} error ${r.status}: ${await r.text()}`);
  }
  return { count: rows.length };
}

async function fetchSportmonksFixtures() {
  // If you later find the exact World Cup 2026 season ID in SportMonks, add it in Vercel as SPORTMONKS_SEASON_ID.
  // Otherwise, this imports fixtures between the tournament dates that your SportMonks plan exposes.
  const includes = 'participants;scores;state;venue;round;stage;group';
  const seasonId = process.env.SPORTMONKS_SEASON_ID;
  let url;

  if (seasonId) {
    url = `${SPORTMONKS_BASE}/fixtures?api_token=${encodeURIComponent(SPORTMONKS_TOKEN)}&include=${encodeURIComponent(includes)}&filters=fixtureSeasons:${encodeURIComponent(seasonId)}&per_page=100`;
  } else {
    url = `${SPORTMONKS_BASE}/fixtures/between/2026-06-10/2026-07-20?api_token=${encodeURIComponent(SPORTMONKS_TOKEN)}&include=${encodeURIComponent(includes)}&per_page=100`;
  }

  const all = [];
  for (let page = 1; page <= 5; page++) {
    const pageUrl = url + `&page=${page}`;
    const r = await fetch(pageUrl);
    const text = await r.text();
    if (!r.ok) throw new Error(`SportMonks fixtures error ${r.status}: ${text}`);
    const payload = JSON.parse(text);
    const rows = Array.isArray(payload.data) ? payload.data : [];
    all.push(...rows);
    if (!payload.pagination?.has_more) break;
  }
  return all;
}

async function sync() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SPORTMONKS_TOKEN) {
    throw new Error('Missing env vars. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SPORTMONKS_TOKEN');
  }

  const fixtures = await fetchSportmonksFixtures();
  const matches = fixtures.map(mapFixtureToMatch).filter(m => m.sportmonks_id && m.date);

  await supabaseUpsert('matches', matches, 'id');

  const liveRows = matches.map(m => ({
    match_id: m.id,
    status: m.status,
    minute: m.minute,
    score_a: m.score_a,
    score_b: m.score_b,
    updated_at: new Date().toISOString()
  }));
  await supabaseUpsert('live_match_state', liveRows, 'match_id');

  return {
    ok: true,
    fixtures_received: fixtures.length,
    matches_upserted: matches.length,
    note: matches.length ? 'Supabase updated.' : 'No fixtures returned. Check SportMonks plan/access or add SPORTMONKS_SEASON_ID.'
  };
}

module.exports = async function handler(req, res) {
  try {
    // Basic protection: optional CRON_SECRET. If defined, call /api/sync-worldcup?secret=xxx
    if (process.env.CRON_SECRET && req.query.secret !== process.env.CRON_SECRET) {
      return json(res, 401, { ok: false, error: 'Unauthorized' });
    }
    const result = await sync();
    return json(res, 200, result);
  } catch (err) {
    return json(res, 500, { ok: false, error: String(err.message || err) });
  }
};
