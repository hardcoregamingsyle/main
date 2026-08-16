const express = require('express');
const helmet = require('helmet');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '1kb' }));

// Serve static files from src/
app.use(express.static(path.join(__dirname, 'src')));

// Initialize SQLite database
const db = new Database('highscore.db');

db.exec(`CREATE TABLE IF NOT EXISTS highscore (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  score INTEGER NOT NULL DEFAULT 0
)`);
// Ensure a single row exists
const row = db.prepare('SELECT id FROM highscore WHERE id = 1').get();
if (!row) {
  db.prepare('INSERT INTO highscore (id, score) VALUES (1, 0)').run();
}

// GET /api/highscore - retrieve high score
app.get('/api/highscore', (req, res) => {
  try {
    const high = db.prepare('SELECT score FROM highscore WHERE id = 1').get();
    res.json({ highscore: high.score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/highscore - update high score (only if higher)
app.post('/api/highscore', (req, res) => {
  const { score } = req.body;
  // Validate input
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: 'Invalid score' });
  }
  try {
    const current = db.prepare('SELECT score FROM highscore WHERE id = 1').get();
    if (score > current.score) {
      db.prepare('UPDATE highscore SET score = ? WHERE id = 1').run(score);
      res.json({ highscore: score, updated: true });
    } else {
      res.json({ highscore: current.score, updated: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback to index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Export app for testing
module.exports = app;

// Start server only if this module is run directly
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}
