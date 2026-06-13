// Guide Mondial 2026 — Notifications OneSignal
// Cron Vercel : envoie une notification 15 min avant chaque match

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ONESIGNAL_APP_ID = 'b3e956ce-d830-4ad3-9fc9-383ac8c5bb87';
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body, null, 2));
}

function parisNow() {
  return new Date(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(new Date()).replace(',', ''));
}

async function getUpcomingMatches() {
  const now = parisNow();
  // Cherche les matchs qui commencent dans 14-16 minutes
  const url = `${SUPABASE_URL}/rest/v1/matches?select=id,team_a,team_b,date,time_fr,status&status=eq.upcoming`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    }
  });
  const matches = await res.json();
  
  const nowMs = now.getTime();
  return (matches || []).filter(m => {
    if (!m.date || !m.time_fr) return false;
    const start = new Date(`${m.date}T${m.time_fr}:00+02:00`).getTime();
    const diffMin = (start - nowMs) / 60000;
    return diffMin >= 14 && diffMin <= 16;
  });
}

async function sendNotification(match) {
  const title = `⚽ Match dans 15 min !`;
  const message = `${match.team_a} vs ${match.team_b} — Guide Mondial 2026`;
  
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Total Subscriptions'],
      headings: { fr: title, en: title },
      contents: { fr: message, en: message },
      url: 'https://guidemondial2026.fr',
      chrome_web_icon: 'https://guidemondial2026.fr/icon-192.png',
    })
  });
  
  return res.json();
}

module.exports = async function handler(req, res) {
  try {
    const matches = await getUpcomingMatches();
    
    if (!matches.length) {
      return json(res, 200, { ok: true, message: 'Aucun match dans 15 min', checked_at: new Date().toISOString() });
    }
    
    const results = [];
    for (const match of matches) {
      const result = await sendNotification(match);
      results.push({ match: `${match.team_a} vs ${match.team_b}`, result });
    }
    
    return json(res, 200, { ok: true, notifications_sent: results.length, results });
  } catch (err) {
    return json(res, 500, { ok: false, error: String(err.message) });
  }
};
