const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const redis = require('../config/redis');
const { getLocation } = require('../utils/geoIp');


router.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    
    let originalUrl = await redis.get(`url:${code}`);

    if (!originalUrl) {
      
      const result = await pool.query(
        `SELECT original_url, expires_at FROM urls WHERE short_code = $1`,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      const row = result.rows[0];

      
      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        return res.status(410).json({ error: 'This link has expired' });
      }

      originalUrl = row.original_url;

      
      await redis.set(`url:${code}`, originalUrl, { ex: 86400 });
    }

   
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';

    
    (async () => {
      try {
        const { country, city } = await getLocation(ip);
        await pool.query(
          `INSERT INTO clicks (short_code, ip_address, country, city, user_agent, referer)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [code, ip, country, city, userAgent, referer]
        );
        
        await pool.query(
          `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`,
          [code]
        );
      } catch (err) {
        console.error('Analytics error:', err.message);
      }
    })();

    
    return res.redirect(301, originalUrl);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;