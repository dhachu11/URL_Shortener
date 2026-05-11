const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const redis = require('../config/redis');
const { generateCode } = require('../utils/codeGen');


router.post('/', async (req, res) => {
  const { url, customCode, expiresIn } = req.body;

 
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const code = customCode || generateCode();

  
    if (customCode) {
      const existing = await pool.query(
        'SELECT short_code FROM urls WHERE short_code = $1',
        [customCode]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Custom code already in use' });
      }
    }

    
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : null;

   
    await pool.query(
      `INSERT INTO urls (short_code, original_url, expires_at)
       VALUES ($1, $2, $3)`,
      [code, url, expiresAt]
    );

    
    await redis.set(`url:${code}`, url, { ex: 86400 });

    const shortUrl = `${process.env.BASE_URL}/${code}`;
    return res.status(201).json({
      shortUrl,
      code,
      originalUrl: url,
      expiresAt: expiresAt || 'Never'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;