export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/leagues?search=World Cup",
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    );

    const data = await response.json();

    res.status(200).json({
      success: true,
      results: data.results,
      response: data.response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
