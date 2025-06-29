const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }

  // Extract channel and subPath from req.params
  const { channel, subPath } = req.params;

  // Construct the target URL
  const targetUrl = `http://145.239.19.149:9300/${channel}/${subPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

  try {
    // Forward the request to the origin server
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // Set headers from the origin response
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the response body
    response.body.pipe(res);
  } catch (error) {
    console.error(`Error fetching ${targetUrl}: ${error.message}`);
    res.status(500).send('Error fetching the stream');
  }
};
