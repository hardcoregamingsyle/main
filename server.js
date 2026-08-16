const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting — simple in-memory
const rateLimit = new Map();
const RATE_WINDOW = 60 * 1000; // 1 minute
const RATE_MAX = 100;

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry && now - entry.start < RATE_WINDOW) {
    entry.count++;
    if (entry.count > RATE_MAX) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
  } else {
    rateLimit.set(ip, { start: now, count: 1 });
  }
  next();
});

// Periodic cleanup of rate limit map
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit.entries()) {
    if (now - entry.start > RATE_WINDOW * 2) {
      rateLimit.delete(ip);
    }
  }
}, RATE_WINDOW * 2);

// Serve static files from src/
app.use(express.static(path.join(__dirname, 'src'), {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// No stack traces in errors
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, HOST, () => {
  console.log(`Girl Flapper server running at http://${HOST}:${PORT}`);
});

module.exports = app;
