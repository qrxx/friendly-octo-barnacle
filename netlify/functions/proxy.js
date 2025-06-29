const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const { channel, path } = event.queryStringParameters;

  if (!channel || !path) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing channel or path' }),
    };
  }

  const targetUrl = `http://145.239.19.149:9300/${channel}/${path}`;
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Error fetching from origin: ${response.statusText}` }),
      };
    }

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    const body = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
      body: body,
    };
  } catch (error) {
    console.error(`Error fetching ${targetUrl}: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching the stream' }),
    };
  }
};
