const http = require('http');
const https = require('https');

module.exports = async (req, res) => {
  // Extract the full path from the request
  const path = req.query.path.join('/');
  
  // Get the channel (first part of path) and remaining path
  const [channel, ...rest] = path.split('/');
  const subPath = rest.join('/');
  
  // Your target server URL (can be made configurable)
  const targetUrl = `http://145.239.19.149:9300/${channel}/${subPath}`;
  
  // Choose the appropriate protocol module
  const protocol = targetUrl.startsWith('https') ? https : http;
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(200).end();
    return;
  }
  
  // Forward the request to the origin server
  return new Promise((resolve) => {
    protocol.get(targetUrl, (response) => {
      // Set appropriate headers
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Cache-Control', 'no-cache');
      
      // Pipe the response to the client
      response.pipe(res);
      response.on('end', resolve);
    }).on('error', (err) => {
      console.error(`Error fetching ${targetUrl}: ${err.message}`);
      res.status(500).send('Error fetching the stream');
      resolve();
    });
  });
};
