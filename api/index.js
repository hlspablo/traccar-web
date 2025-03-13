// Create a proxy to redirect requests from '/api/*' to 'http://coragemserver.top/api/*'
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create the proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'http://coragemserver.top',
  changeOrigin: true,
  ws: true, // Support WebSockets
  secure: false,
  onProxyRes(proxyRes) {
    // Add CORS headers if needed
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
  },
});

// Expose the proxy on the '/api/*' endpoint
export default function handler(req, res) {
  // Don't allow direct access to this URL in browser
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Use apiProxy and don't return a value
  apiProxy(req, res);
}
