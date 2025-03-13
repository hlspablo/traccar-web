// Create a proxy to redirect requests from '/api/*' to 'http://coragemserver.top/api/*'
import http from 'http';
import { URL } from 'url';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.status(200).end();
    return;
  }

  // Parse the target URL
  const targetUrl = new URL(req.url, 'https://coragemserver.top');

  // Forward the request
  const proxyReq = http.request({
    hostname: 'coragemserver.top',
    port: 80,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'coragemserver.top',
    },
  }, (proxyRes) => {
    // Forward the response headers
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    });

    // Forward the response body
    proxyRes.pipe(res);
  });

  // Handle proxy errors
  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error' });
  });

  // Forward the request body if any
  if (req.body) {
    proxyReq.write(req.body);
  }

  proxyReq.end();
}
