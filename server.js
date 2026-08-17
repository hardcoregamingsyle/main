const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting (simple in-memory)
const requestCounts = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 1000;
  const maxRequests = 100;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const timestamps = requestCounts.get(ip);
  // Remove old timestamps
  while (timestamps.length > 0 && now - timestamps[0] > windowMs) {
    timestamps.shift();
  }

  if (timestamps.length >= maxRequests) {
    return res.status(429).send('Too many requests');
  }

  timestamps.push(now);
  next();
});

// Serve static files from src/
app.use(express.static(path.join(__dirname, 'src')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// For any other route, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
