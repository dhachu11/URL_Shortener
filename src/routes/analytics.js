const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const path = require('path');

// GET /analytics/:code - Serve the HTML dashboard
router.get('/:code', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/analytics.html'));
});

// GET /analytics/api/:code - Return the JSON data
router.get('/api/:code', async (req, res) => {
  const { code } = req.params;

  try {
    
    const urlResult = await pool.query(
      `SELECT original_url, created_at, click_count, expires_at
       FROM urls WHERE short_code = $1`,
      [code]
    );

    if (urlResult.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlInfo = urlResult.rows[0];

    
    const byCountry = await pool.query(
      `SELECT country, COUNT(*) as count
       FROM clicks WHERE short_code = $1
       GROUP BY country ORDER BY count DESC`,
      [code]
    );

    
    const byDay = await pool.query(
      `SELECT DATE(clicked_at) as date, COUNT(*) as count
       FROM clicks
       WHERE short_code = $1
         AND clicked_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(clicked_at)
       ORDER BY date`,
      [code]
    );

    
    const recentClicks = await pool.query(
      `SELECT clicked_at, country, city, referer
       FROM clicks WHERE short_code = $1
       ORDER BY clicked_at DESC LIMIT 10`,
      [code]
    );

    return res.json({
      code,
      originalUrl: urlInfo.original_url,
      createdAt: urlInfo.created_at,
      expiresAt: urlInfo.expires_at || 'Never',
      totalClicks: urlInfo.click_count,
      clicksByCountry: byCountry.rows,
      clicksByDay: byDay.rows,
      recentClicks: recentClicks.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;