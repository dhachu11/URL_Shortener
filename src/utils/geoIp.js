const axios = require('axios');

async function getLocation(ip) {
  try {
   
    if (ip === '::1' || ip === '127.0.0.1') {
      return { country: 'Local', city: 'Local' };
    }
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=country,city,status`);
    if (res.data.status === 'success') {
      return { country: res.data.country, city: res.data.city };
    }
    return { country: 'Unknown', city: 'Unknown' };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

module.exports = { getLocation };