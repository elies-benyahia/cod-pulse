const express = require('express');
const router = express.Router();

// ── Twitch App Access Token cache ───────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

async function getTwitchToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET manquants dans .env');
  }

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) throw new Error(`Twitch token error: ${res.status}`);
  const data = await res.json();

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000; // marge 5min
  return cachedToken;
}

// ── GET /api/live — statuts Twitch des joueurs pros ─────────
// Query: ?channels=Shotzzy,Dashy,Swagg,...
const DEFAULT_CHANNELS = [
  'Shotzzy', 'Dashy', 'Simp', 'aBeZy', 'HyDra',
  'CleanX', 'Ghosty', 'swagg', 'cloakzy', 'symfuhny',
  'huskerrs', 'skullace', 'zSmit', 'skullace_', 'maux',
];

router.get('/', async (req, res) => {
  try {
    const channels = req.query.channels
      ? req.query.channels.split(',').map(c => c.trim()).slice(0, 50)
      : DEFAULT_CHANNELS;

    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    // Récupérer les user_id depuis les logins
    const loginParams = channels.map(c => `login=${encodeURIComponent(c.toLowerCase())}`).join('&');
    const usersRes = await fetch(`https://api.twitch.tv/helix/users?${loginParams}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!usersRes.ok) throw new Error(`Twitch users error: ${usersRes.status}`);
    const { data: users } = await usersRes.json();

    if (!users || users.length === 0) {
      return res.json({ streams: [], channels: [] });
    }

    // Récupérer les streams en direct
    const streamParams = users.map(u => `user_id=${u.id}`).join('&');
    const streamsRes = await fetch(`https://api.twitch.tv/helix/streams?${streamParams}&first=50`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!streamsRes.ok) throw new Error(`Twitch streams error: ${streamsRes.status}`);
    const { data: streams } = await streamsRes.json();

    const liveSet = new Set(streams.map(s => s.user_login.toLowerCase()));

    const result = users.map(u => ({
      login: u.login,
      displayName: u.display_name,
      profileImageUrl: u.profile_image_url,
      isLive: liveSet.has(u.login.toLowerCase()),
      stream: streams.find(s => s.user_login.toLowerCase() === u.login.toLowerCase()) || null,
    }));

    res.json({ streams: result });
  } catch (err) {
    console.error('[Live] Twitch API error:', err.message);
    // Retourner données vides sans planter le site
    res.json({ streams: [], error: err.message });
  }
});

module.exports = router;
