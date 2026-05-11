require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const shortenRouter = require('./routes/shorten');
const redirectRouter = require('./routes/redirect');
const analyticsRouter = require('./routes/analytics');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();


app.use(cors());
app.use(express.json());
app.use(rateLimiter);


app.use(express.static(path.join(__dirname, '../public')));


app.use('/shorten', shortenRouter);
app.use('/analytics', analyticsRouter);


app.use('/', redirectRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});