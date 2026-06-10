export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      ok: false,
      error: "Variable API_FOOTBALL_KEY absente dans Vercel.",
    });
  }

  const headers = { "x-apisports-key": API_KEY };

  async function callApi(path) {
    const url = `https://v3.football.api-sports.io${path}`;
    const response = await fetch(url, { headers });
    const json = await response.json();

    return {
      url: path,
      httpStatus: response.status,
      results: json.results ?? null,
      errors: json.errors ?? null,
      paging: json.paging ?? null,
      sample: Array.isArray(json.response) ? json.response.slice(0, 10) : json.response,
    };
  }

  try {
    const checks = {};

    // Tests principaux Coupe du Monde 2026.
    checks.worldCupLeague1Season2026 = await callApi("/fixtures?league=1&season=2026");
    checks.worldCupLeague1Dates = await callApi("/fixtures?league=1&from=2026-06-01&to=2026-07-31");
    checks.worldCupLeague1Season2026Dates = await callApi("/fixtures?league=1&season=2026&from=2026-06-01&to=2026-07-31");

    // Test du match d'ouverture attendu autour du 11 juin 2026.
    checks.openingDay = await callApi("/fixtures?league=1&season=2026&date=2026-06-11");

    return res.status(200).json({
      ok: true,
      message: "Test fixtures Coupe du Monde 2026 terminé.",
      readingGuide: {
        good: "Si un des tests retourne results > 0, les fixtures sont accessibles via API-Football.",
        warning: "Si tout retourne results:0 mais sans erreur, l'API fonctionne mais les fixtures ne sont pas encore exposées avec ces filtres.",
        error: "Si errors contient un message, copie-le dans ChatGPT.",
      },
      checks,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
