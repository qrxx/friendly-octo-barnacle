const http = require('http');

module.exports = (req, res) => {
  const { channel, path } = req.query; // Extract channel and path from query params
  if (!channel || !path) {
    return res.status(400).json({ error: 'Missing channel or path' });
  }

  const targetUrl = `http://146.59.54.154/${channel}/${path}`;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  // Forward the request
  http.get(targetUrl, (response) => {
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'no-cache');

    response.pipe(res);
  }).on('error', (err) => {
    console.error(`Error fetching ${targetUrl}: ${err.message}`);
    res.status(500).json({ error: 'Error fetching the stream' });
  });
};
