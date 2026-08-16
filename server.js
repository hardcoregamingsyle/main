const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || "scores.db";

// Security middleware
app.use(helmet());
app.use(express.json({ limit: "1kb" })); // Limit body size

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Initialize database
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Validate name and score
function validateScore(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    errors.push("Invalid request body");
    return errors;
  }
  const { name, score } = data;
  if (typeof name !== "string" || !/^[a-zA-Z0-9 _-]{1,20}$/.test(name.trim())) {
    errors.push("Name must be 1-20 alphanumeric characters, spaces, underscores, or hyphens");
  }
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 999999) {
    errors.push("Score must be an integer between 0 and 999999");
  }
  return errors;
}

// GET /api/highscores
app.get("/api/highscores", (req, res) => {
  try {
    const highscores = db.prepare("SELECT name, score, created_at FROM scores ORDER BY score DESC LIMIT 10").all();
    res.json(highscores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/scores
app.post("/api/scores", (req, res) => {
  const errors = validateScore(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const { name, score } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO scores (name, score) VALUES (?, ?)");
    stmt.run(name.trim(), score);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static files from src/
app.use(express.static(path.join(__dirname, "src")));

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
