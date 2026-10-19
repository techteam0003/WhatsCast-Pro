import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API: Server-side Node.js health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    runtime: 'Node.js (Express)',
    version: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API: Server-side Indian phone number validator (+91)
app.post('/api/validate-phone', (req, res) => {
  const { phone, countryCode = '91' } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  const cleaned = String(phone).replace(/[^\d]/g, '');
  let nationalNumber = cleaned;

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    nationalNumber = cleaned.slice(1);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    nationalNumber = cleaned.slice(2);
  }

  const isValid = nationalNumber.length === 10 && /^[6-9]\d{9}$/.test(nationalNumber);

  res.json({
    phone,
    cleaned: nationalNumber,
    fullPhone: `+91${nationalNumber}`,
    isValid,
    error: isValid ? undefined : 'Indian phone must be 10 digits starting with 6, 7, 8, or 9',
  });
});

// Step 13: Meta Webhook Verification (GET /api/webhook)
app.get('/api/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.META_VERIFY_TOKEN || 'whatscast_webhook_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('Meta Webhook verified successfully with challenge:', challenge);
    return res.status(200).send(challenge);
  } else {
    return res.status(403).json({ error: 'Verification token mismatch' });
  }
});

// Step 13: Meta Webhook Event Handler (POST /api/webhook)
app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Received Meta Webhook event:', JSON.stringify(body));
  res.status(200).send('EVENT_RECEIVED');
});
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Only start listening if executed directly (e.g. node/tsx server.ts)
if (process.env.NODE_ENV === 'production' || !process.env.VITE) {
  app.listen(PORT, () => {
    console.log(`Server-side backend (Node.js) listening on port ${PORT}`);
  });
}

export default app;
