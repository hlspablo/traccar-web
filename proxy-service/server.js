const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Asaas API configuration
const ASAAS_BASE_URL = 'https://api.asaas.com';
const ASAAS_ACCESS_TOKEN = process.env.ASAAS_ACCESS_TOKEN || '';

// ZapSign API configuration
const ZAPSIGN_BASE_URL = 'https://api.zapsign.com.br';
const ZAPSIGN_ACCESS_TOKEN = process.env.ZAPSIGN_ACCESS_TOKEN || '';

// Create HTTPS agent with simplified TLS configuration
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  timeout: 30000,
  // Use modern TLS configuration without conflicts
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
});

// Middleware
app.use(cors({
  origin: ['https://coragemadm.top', 'https://www.coragemadm.top', 'https://traccar-web-z4zr.onrender.com', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'asaas-zapsign-proxy' });
});

// Test endpoint to check Asaas connection
app.get('/test/asaas', async (req, res) => {
  try {
    const testUrl = `${ASAAS_BASE_URL}/v3/customers?limit=1`;
    console.log(`Testing Asaas connection to: ${testUrl}`);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        access_token: ASAAS_ACCESS_TOKEN,
        'User-Agent': 'Asaas-Proxy-Test/1.0',
      },
      agent: httpsAgent,
      timeout: 10000,
    });

    res.json({
      status: 'Asaas connection successful',
      statusCode: response.status,
      url: testUrl,
    });
  } catch (error) {
    console.error('Asaas test connection failed:', error);
    res.status(500).json({
      status: 'Asaas connection failed',
      error: error.message,
      code: error.code,
    });
  }
});

// Test endpoint to check ZapSign connection
app.get('/test/zapsign', async (req, res) => {
  try {
    const testUrl = `${ZAPSIGN_BASE_URL}/api/v1/templates/`;
    console.log(`Testing ZapSign connection to: ${testUrl}`);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ZAPSIGN_ACCESS_TOKEN}`,
        'User-Agent': 'ZapSign-Proxy-Test/1.0',
        'Content-Type': 'application/json',
      },
      agent: httpsAgent,
      timeout: 10000,
    });

    res.json({
      status: 'ZapSign connection successful',
      statusCode: response.status,
      url: testUrl,
    });
  } catch (error) {
    console.error('ZapSign test connection failed:', error);
    res.status(500).json({
      status: 'ZapSign connection failed',
      error: error.message,
      code: error.code,
    });
  }
});

// Common error handler for proxy errors
function handleProxyError(res, error, apiName) {
  // Handle different types of errors
  if (error.code === 'EPROTO' || error.code === 'ECONNRESET') {
    res.status(502).json({
      error: 'SSL/TLS connection error',
      message: `Unable to establish secure connection to ${apiName}`,
      details: error.message,
    });
  } else if (error.code === 'ETIMEDOUT') {
    res.status(504).json({
      error: 'Request timeout',
      message: `Request to ${apiName} timed out`,
    });
  } else if (error.code === 'ERR_TLS_PROTOCOL_VERSION_CONFLICT') {
    res.status(502).json({
      error: 'TLS protocol conflict',
      message: 'TLS configuration conflict - check server logs',
      details: error.message,
    });
  } else {
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      code: error.code,
      api: apiName,
    });
  }
}

// Proxy all requests to Asaas API
app.all('/v3/*', async (req, res) => {
  try {
    const asaasUrl = `${ASAAS_BASE_URL}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    console.log(`Proxying Asaas ${req.method} ${asaasUrl}`);

    // Prepare headers
    const headers = {
      access_token: ASAAS_ACCESS_TOKEN,
      'User-Agent': 'Asaas-Proxy/1.0',
      Accept: 'application/json',
    };

    // Only set Content-Type for requests with body
    if (req.method !== 'GET' && req.body) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions = {
      method: req.method,
      headers,
      agent: httpsAgent,
      timeout: 30000,
    };

    if (req.method !== 'GET' && req.body) {
      requestOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(asaasUrl, requestOptions);

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Set response status
    res.status(response.status);

    // Copy safe headers
    const safeHeaders = ['content-type', 'cache-control', 'etag', 'last-modified'];
    safeHeaders.forEach((header) => {
      const value = response.headers.get(header);
      if (value) {
        res.set(header, value);
      }
    });

    // Send response
    if (typeof data === 'object') {
      res.json(data);
    } else {
      res.send(data);
    }
  } catch (error) {
    console.error('Asaas proxy error:', error);
    handleProxyError(res, error, 'Asaas API');
  }
});

// Proxy all requests to ZapSign API
app.all('/api/v1/*', async (req, res) => {
  try {
    const zapSignUrl = `${ZAPSIGN_BASE_URL}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    console.log(`Proxying ZapSign ${req.method} ${zapSignUrl}`);

    // Prepare headers
    const headers = {
      Authorization: `Bearer ${ZAPSIGN_ACCESS_TOKEN}`,
      'User-Agent': 'ZapSign-Proxy/1.0',
      Accept: 'application/json',
    };

    // Only set Content-Type for requests with body
    if (req.method !== 'GET' && req.body) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions = {
      method: req.method,
      headers,
      agent: httpsAgent,
      timeout: 30000,
    };

    if (req.method !== 'GET' && req.body) {
      requestOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(zapSignUrl, requestOptions);

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Set response status
    res.status(response.status);

    // Copy safe headers
    const safeHeaders = ['content-type', 'cache-control', 'etag', 'last-modified'];
    safeHeaders.forEach((header) => {
      const value = response.headers.get(header);
      if (value) {
        res.set(header, value);
      }
    });

    // Send response
    if (typeof data === 'object') {
      res.json(data);
    } else {
      res.send(data);
    }
  } catch (error) {
    console.error('ZapSign proxy error:', error);
    handleProxyError(res, error, 'ZapSign API');
  }
});

app.listen(PORT, () => {
  console.log(`Asaas & ZapSign proxy server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`TLS reject unauthorized: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED || 'default'}`);
  console.log(`Asaas API: ${ASAAS_BASE_URL}`);
  console.log(`ZapSign API: ${ZAPSIGN_BASE_URL}`);
});
