// Create a proxy to redirect requests from '/api/*' to 'http://coragemserver.top/api/*'
import http from 'http';
import { URL } from 'url';
import getRawBody from 'raw-body';

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
  const targetUrl = new URL(req.url, 'http://coragemserver.top');

  // Prepare headers - clone headers but remove host and connection
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;

  // Set appropriate headers for the target
  headers.host = 'coragemserver.top';

  try {
    // Handle raw body for uploading files and multipart forms
    let rawBody;
    let bodyIsStream = false;

    // Check if we need to handle the body (POST, PUT, PATCH methods)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentTypeHeader = req.headers['content-type'];

      if (contentTypeHeader) {
        // Check if it's a multipart form (likely a file upload)
        if (contentTypeHeader.includes('multipart/form-data')) {
          bodyIsStream = true;
        } else if (contentTypeHeader.includes('image/')
                || contentTypeHeader.includes('audio/')
                || contentTypeHeader.includes('video/')
                || contentTypeHeader.includes('application/octet-stream')) {
          // Check if it's a binary content type
          bodyIsStream = true;
        } else if (!req.body && (
          contentTypeHeader.includes('application/json')
          || contentTypeHeader.includes('application/x-www-form-urlencoded')
        )) {
          // For JSON or form-urlencoded, we already have req.body in most cases
          // If req.body is not available, get the raw body
          try {
            rawBody = await getRawBody(req);
          } catch (error) {
            console.error('Error reading request body:', error);
          }
        }
      }
    }

    // Create proxy request options
    const options = {
      hostname: 'coragemserver.top',
      port: 80,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers,
    };

    // Create the proxy request
    const proxyReq = http.request(options);

    // Forward the original request to the target
    await new Promise((resolve, reject) => {
      // Set up proxy response handler
      proxyReq.on('response', (proxyRes) => {
        // Forward status code and headers
        res.statusCode = proxyRes.statusCode;

        // Add CORS headers
        const responseHeaders = {
          ...proxyRes.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        };

        // Set headers on response
        Object.keys(responseHeaders).forEach((key) => {
          res.setHeader(key, responseHeaders[key]);
        });

        // Pipe proxy response to client response
        proxyRes.pipe(res);
        proxyRes.on('end', resolve);
      });

      // Handle proxy request errors
      proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Proxy request failed' });
        }
        reject(err);
      });

      // Handle request body differently based on content type
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (bodyIsStream) {
          // For multipart forms and binary data, pipe the request stream directly
          req.pipe(proxyReq);
        } else if (rawBody) {
          // If we captured the raw body earlier, write it directly
          proxyReq.write(rawBody);
          proxyReq.end();
        } else if (req.body) {
          // For JSON and other structured data
          try {
            const bodyStr = typeof req.body === 'object'
              ? JSON.stringify(req.body)
              : String(req.body);

            proxyReq.write(bodyStr);
            proxyReq.end();
          } catch (e) {
            console.error('Error processing body:', e);
            proxyReq.end();
          }
        } else {
          // No body detected
          proxyReq.end();
        }
      } else {
        // For methods without body (GET, DELETE, etc.)
        proxyReq.end();
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to proxy request' });
    }
  }
}
