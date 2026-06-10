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
      sample: Array.isArray(json.response) ? json.response.slice(0, 5) : json.response,
    };
  }

  try {
    const checks = {};

    checks.status = await callApi("/status");
    checks.searchWorldCup = await callApi("/leagues?search=World%20Cup");
    checks.worldCup2022 = await callApi("/fixtures?league=1&season=2022");
    checks.worldCup2026 = await callApi("/fixtures?league=1&season=2026");
    checks.league1 = await callApi("/leagues?id=1");

    return res.status(200).json({
      ok: true,
      message: "Diagnostic API-Football terminé.",
      interpretation: {
        status: "Si checks.status contient des informations de compte, la clé API fonctionne.",
        searchWorldCup: "Regarde les league.id et seasons disponibles dans sample.",
        worldCup2026: "Si results=0 ici, API-Football n'a probablement pas encore les fixtures 2026 dans league=1/season=2026 ou ton plan ne les couvre pas.",
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
