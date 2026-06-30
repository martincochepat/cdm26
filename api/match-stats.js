// API route : stats d'un match via API-Football (avec cache mémoire 30s)
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

// Cache en mémoire (persiste tant que la fonction serverless reste "chaude")
const cache = global.__statsCache || (global.__statsCache = new Map());
const CACHE_TTL = 30 * 1000; // 30 secondes

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { fixture_id } = req.query;
  if (!fixture_id) return res.status(400).json({ error: 'fixture_id requis' });

  const cacheKey = `stats_${fixture_id}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.time) < CACHE_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached.data);
  }

  try {
    const r = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${encodeURIComponent(fixture_id)}`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    const data = await r.json();
    const result = { stats: Array.isArray(data.response) ? data.response : [] };
    cache.set(cacheKey, { data: result, time: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(result);
  } catch(e) {
    res.status(500).json({ error: String(e.message) });
  }
};
