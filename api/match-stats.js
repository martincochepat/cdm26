// API route : stats d'un match via API-Football
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { fixture_id } = req.query;
  if (!fixture_id) return res.status(400).json({ error: 'fixture_id requis' });
  try {
    const r = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${encodeURIComponent(fixture_id)}`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    const data = await r.json();
    res.status(200).json({ stats: Array.isArray(data.response) ? data.response : [] });
  } catch(e) {
    res.status(500).json({ error: String(e.message) });
  }
};
