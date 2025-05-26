const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Asaas API configuration
const ASAAS_BASE_URL = 'https://api-sandbox.asaas.com';
const ASAAS_ACCESS_TOKEN = process.env.ASAAS_ACCESS_TOKEN || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFjZTU1MTFjLWU1OTItNGZiYy05MGYwLTlhNGM2ZGU2ZDNhMDo6JGFhY2hfZTQyODE5MjEtNjljZi00YTAwLWIxNjgtZGQxNzk1ZTU1Nzky';

// Create HTTPS agent with proper SSL configuration
const httpsAgent = new https.Agent({
  rejectUnauthorized: true,
  secureProtocol: 'TLSv1_2_method',
  ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384',
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
});

// Middleware
app.use(cors({
  origin: ['https://traccar-web-z4zr.onrender.com', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'asaas-proxy' });
});

// Proxy all requests to Asaas API
app.all('/v3/*', async (req, res) => {
  try {
    const asaasUrl = `${ASAAS_BASE_URL}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    console.log(`Proxying ${req.method} ${asaasUrl}`);

    // Prepare headers, removing problematic ones
    const headers = {
      'Content-Type': 'application/json',
      access_token: ASAAS_ACCESS_TOKEN,
      'User-Agent': 'Asaas-Proxy/1.0',
    };

    // Only add request body for non-GET methods
    const requestOptions = {
      method: req.method,
      headers,
      agent: httpsAgent,
      timeout: 30000, // 30 second timeout
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

    // Set response headers
    res.status(response.status);

    // Copy relevant headers
    const allowedHeaders = ['content-type', 'cache-control', 'etag'];
    allowedHeaders.forEach((header) => {
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
    console.error('Proxy error:', error);

    // Handle different types of errors
    if (error.code === 'EPROTO' || error.code === 'ECONNRESET') {
      res.status(502).json({
        error: 'SSL/TLS connection error',
        message: 'Unable to establish secure connection to Asaas API',
        details: error.message,
      });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(504).json({
        error: 'Request timeout',
        message: 'Request to Asaas API timed out',
      });
    } else {
      res.status(500).json({
        error: 'Proxy error',
        message: error.message,
        code: error.code,
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Asaas proxy server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
