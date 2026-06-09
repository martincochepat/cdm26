export default async function handler(req, res) {
  res.status(200).json({
    exists: !!process.env.API_FOOTBALL_KEY,
    length: process.env.API_FOOTBALL_KEY
      ? process.env.API_FOOTBALL_KEY.length
      : 0
  });
}
