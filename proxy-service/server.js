const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Asaas API configuration
const ASAAS_BASE_URL = 'https://api-sandbox.asaas.com';
const ASAAS_ACCESS_TOKEN = process.env.ASAAS_ACCESS_TOKEN || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFjZTU1MTFjLWU1OTItNGZiYy05MGYwLTlhNGM2ZGU2ZDNhMDo6JGFhY2hfZTQyODE5MjEtNjljZi00YTAwLWIxNjgtZGQxNzk1ZTU1Nzky';

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

    const response = await fetch(asaasUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_ACCESS_TOKEN,
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();

    res.status(response.status);
    res.set(response.headers);

    try {
      res.json(JSON.parse(data));
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Asaas proxy server running on port ${PORT}`);
});
