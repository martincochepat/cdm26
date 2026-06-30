const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

const cache = global.__h2hCache || (global.__h2hCache = new Map());
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h (l'historique des confrontations ne change quasi jamais dans la journée)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { fixture_id } = req.query;
  if (!fixture_id) return res.status(400).json({ error: 'fixture_id requis' });

  const cacheKey = `h2h_${fixture_id}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.time) < CACHE_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached.data);
  }

  try {
    const fxRes = await fetch(`https://v3.football.api-sports.io/fixtures?id=${encodeURIComponent(fixture_id)}`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    const fxData = await fxRes.json();
    const fixture = (fxData.response || [])[0];
    if (!fixture) {
      const result = { h2h: [] };
      cache.set(cacheKey, { data: result, time: Date.now() });
      return res.status(200).json(result);
    }
    const homeId = fixture.teams?.home?.id;
    const awayId = fixture.teams?.away?.id;
    if (!homeId || !awayId) {
      const result = { h2h: [] };
      cache.set(cacheKey, { data: result, time: Date.now() });
      return res.status(200).json(result);
    }

    const r = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    const data = await r.json();
    const result = { h2h: Array.isArray(data.response) ? data.response : [] };
    cache.set(cacheKey, { data: result, time: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(result);
  } catch(e) {
    res.status(500).json({ error: String(e.message) });
  }
};
