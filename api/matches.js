export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { path } = req.query;
  const url = `https://api.football-data.org/v4/${path || 'competitions/WC/matches'}`;
  try {
    const r = await fetch(url, {
      headers: { 'X-Auth-Token': '569d8cd315284b8b948e60ee17bef8a3' }
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
