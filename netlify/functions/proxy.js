const http = require('http');

exports.handler = async function (event, context) {
  const { channel, path } = event.queryStringParameters || {};
  if (!channel || !path) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing channel or path' }),
    };
  }

  const targetUrl = `http://145.239.19.149:9300/${channel}/${path}`;
  const headers = {
    'Content-Type': 'application/vnd.apple.mpegurl',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  return new Promise((resolve) => {
    http
      .get(targetUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: {
              ...headers,
              'Content-Type': response.headers['content-type'] || 'application/vnd.apple.mpegurl',
            },
            body: data,
          });
        });
      })
      .on('error', (err) => {
        console.error(`Error fetching ${targetUrl}: ${err.message}`);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error fetching the stream' }),
        });
      });
  });
};
