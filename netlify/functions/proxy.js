const http = require('http');
const { parse } = require('url');

exports.handler = async (event, context) => {
  const { path } = event;
  
  // Extract channel and path from URL like /.netlify/functions/proxy/:channel/*
  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length < 4) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid URL format' })
    };
  }
  
  const channel = pathParts[3];
  const restPath = pathParts.slice(4).join('/');
  
  const targetUrl = `http://146.59.54.154/${channel}/${restPath}`;

  // Handle CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/vnd.apple.mpegurl'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Proxy the request
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
      console.error(`Error fetching ${targetUrl}:`, err);
      resolve({
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Error fetching the stream' })
      });
    });
  });
};
