const http = require('http');
const { Buffer } = require('buffer');

exports.handler = async (event) => {
  // Parse the path (works with both direct and redirected URLs)
  const path = event.path.startsWith('/.netlify/functions/proxy') 
    ? event.path.replace('/.netlify/functions/proxy', '')
    : event.path.replace('/proxy', '');

  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) {
    return { statusCode: 400, body: 'Invalid URL format' };
  }

  const channel = parts[0];
  const restPath = parts.slice(1).join('/');
  const targetUrl = `http://145.239.19.149:9300/${channel}/${restPath}`;

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Special handling for TS segments
  if (restPath.endsWith('.ts')) {
    return new Promise((resolve) => {
      http.get(targetUrl, (proxyRes) => {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          resolve({
            statusCode: 200,
            headers: {
              ...headers,
              'Content-Type': 'video/mp2t',
              'Cache-Control': 'public, max-age=86400'
            },
            body: Buffer.concat(chunks).toString('base64'),
            isBase64Encoded: true
          });
        });
      }).on('error', () => {
        resolve({ statusCode: 502, headers, body: 'Bad Gateway' });
      });
    });
  }

  // Normal handling for M3U8 playlists
  return new Promise((resolve) => {
    http.get(targetUrl, (proxyRes) => {
      let data = [];
      proxyRes.on('data', chunk => data.push(chunk));
      proxyRes.on('end', () => {
        resolve({
          statusCode: proxyRes.statusCode || 200,
          headers: {
            ...headers,
            'Content-Type': proxyRes.headers['content-type'] || 'application/vnd.apple.mpegurl'
          },
          body: Buffer.concat(data).toString()
        });
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 502,
        headers,
        body: `Proxy error: ${err.message}`
      });
    });
  });
};
