const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

// GET /api/plans - list PMPro levels via WordPress REST
router.get('/', async (req, res) => {
  try {
    const url = `${config.wordpress.baseUrl}/wp-json/pmpro/v1/levels`;
    const headers = config.wordpress.apiKey
      ? { Authorization: `Bearer ${config.wordpress.apiKey}` }
      : {};

    const wpRes = await axios.get(url, { headers });
    const levels = Array.isArray(wpRes.data) ? wpRes.data : [];

    const normalized = levels.map((lvl) => ({
      id: lvl.id ?? lvl.level_id ?? null,
      name: lvl.name ?? lvl.level_name ?? '',
      initial_payment: lvl.initial_payment ?? 0,
      billing_amount: lvl.billing_amount ?? 0,
      cycle_number: lvl.cycle_number ?? 0,
      cycle_period: lvl.cycle_period ?? null,
      billing_limit: lvl.billing_limit ?? null,
      trial_amount: lvl.trial_amount ?? 0,
      trial_limit: lvl.trial_limit ?? 0
    }));

    res.json({ success: true, plans: normalized });
  } catch (error) {
    console.error('Plans fetch error:', error.response?.data || error.message);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to fetch plans from WordPress'
    });
  }
});

module.exports = router;


