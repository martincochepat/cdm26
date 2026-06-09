export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?league=1&season=2026",
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    );

    const data = await response.json();
    res.status(200).json({
      results: data.results,
      first: data.response?.[0],
      sample: data.response?.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
