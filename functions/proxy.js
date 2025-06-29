const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const { channel, path } = event.queryStringParameters;

  if (!channel || !path) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing channel or path' }),
    };
  }

  const targetUrl = `http://146.59.54.155/${channel}/${path}`;
  console.log(`Fetching: ${targetUrl}`); // Log for debugging

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
      // Increase timeout for .ts files
      timeout: 10000, // 10 seconds
    });

    if (!response.ok) {
      console.error(`Upstream error: ${response.status} ${response.statusText}`);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Upstream error: ${response.statusText}` }),
      };
    }

    const contentType = response.headers.get('content-type') || (path.endsWith('.ts') ? 'video/mp2t' : 'application/vnd.apple.mpegurl');
    const body = path.endsWith('.ts') ? response.body : await response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': path.endsWith('.ts') ? 'public, max-age=86400' : 'no-cache',
      },
      body: path.endsWith('.ts') ? body : body.toString('utf-8'),
      isBase64Encoded: path.endsWith('.ts'), // Stream .ts files as binary
    };
  } catch (error) {
    console.error(`Error fetching ${targetUrl}: ${error.message}`);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `Error fetching from upstream: ${error.message}` }),
    };
  }
};
