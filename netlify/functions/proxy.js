const http = require('http');

exports.handler = async (event, context) => {
  // Extract path after '/.netlify/functions/proxy'
  let path = event.path.replace(/^\/\.netlify\/functions\/proxy\/?/, '');
  
  // Handle empty path
  if (!path) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing channel parameter' })
    };
  }

  const [channel, ...rest] = path.split('/');
  const restPath = rest.join('/');
  const targetUrl = `http://145.239.19.149:9300/${channel}/${restPath}`;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/vnd.apple.mpegurl'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  return new Promise((resolve) => {
    http.get(targetUrl, (proxyRes) => {
      let data = [];
      proxyRes.on('data', chunk => data.push(chunk));
      proxyRes.on('end', () => {
        headers['Content-Type'] = proxyRes.headers['content-type'] || 'application/vnd.apple.mpegurl';
        resolve({
          statusCode: proxyRes.statusCode || 200,
          headers,
          body: Buffer.concat(data).toString()
        });
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Proxy error: ${err.message}` })
      });
    });
  });
};
