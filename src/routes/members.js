const express = require('express');
const router = express.Router();

// Middleware: valida WP API key (vindo do header X-API-KEY ou Authorization Bearer)
function validateWPAPIKey(req, res, next) {
  const envKey = (process.env.WP_API_KEY || '').replace(/"/g, '').trim();
  const headerKey = (req.get('X-API-KEY') || req.get('x-api-key') || (req.get('authorization') || '').replace(/^Bearer\s+/i, '')).trim();

  if (!envKey) {
    return res.status(500).json({ error: 'server_error', message: 'WP_API_KEY not configured on server' });
  }

  if (!headerKey || headerKey !== envKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or missing API key' });
  }

  next();
}

// POST /api/members/sync
router.post('/sync', validateWPAPIKey, async (req, res) => {
  try {
    const payload = req.body || {};
    
    // Aqui você pode persistir em DB, emitir eventos, chamar PMPro mapping, etc.
    console.log('[WP_SYNC] Received payload from WP:', payload);
    
    // Exemplo simples de resposta OK
    return res.json({ success: true, message: 'Membership sync received', payload });
  } catch (err) {
    console.error('[WP_SYNC] error', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to process membership sync' });
  }
});

// Alias endpoint (compatível com plugin antigo)
router.post('/webhooks/membership', validateWPAPIKey, (req, res) => {
  // Redireciona para handler /sync
  req.url = '/sync';
  return router.handle(req, res);
});


module.exports = router;

