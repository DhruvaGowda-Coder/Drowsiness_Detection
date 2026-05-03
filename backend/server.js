const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'sessions.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration INTEGER,
      blinkCount INTEGER,
      drowsyWarnings INTEGER,
      emergencyStops INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Routes
app.post('/api/sessions', (req, res) => {
  const { duration, blinkCount, drowsyWarnings, emergencyStops } = req.body;
  
  const sql = `INSERT INTO sessions (duration, blinkCount, drowsyWarnings, emergencyStops) VALUES (?, ?, ?, ?)`;
  const params = [duration || 0, blinkCount || 0, drowsyWarnings || 0, emergencyStops || 0];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Session saved successfully',
      id: this.lastID
    });
  });
});

app.get('/api/sessions', (req, res) => {
  const sql = 'SELECT * FROM sessions ORDER BY timestamp DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
