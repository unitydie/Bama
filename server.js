// server.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // чтобы принимать base64 картинок
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== DB init
const DB_FILE = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      image TEXT NOT NULL,        -- можно хранить URL или dataURL (base64)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Однократно зальём стартовые данные из public/data.json, если таблица пустая
  db.get('SELECT COUNT(*) AS cnt FROM products', (err, row) => {
    if (err) return console.error(err);
    if (row.cnt === 0) {
      const dataPath = path.join(__dirname, 'public', 'data.json');
      if (fs.existsSync(dataPath)) {
        try {
          const raw = fs.readFileSync(dataPath, 'utf8');
          const json = JSON.parse(raw);
          const smoothies = Array.isArray(json.smoothies) ? json.smoothies : [];
          const stmt = db.prepare('INSERT INTO products (name, ingredients, image) VALUES (?, ?, ?)');
          smoothies.forEach(s => {
            stmt.run(s.name, s.ingredients, s.image);
          });
          stmt.finalize();
          console.log(`✅ Seeded ${smoothies.length} products from data.json`);
        } catch (e) {
          console.warn('⚠️ Could not seed from data.json:', e.message);
        }
      }
    }
  });
});

// ===== API
// Получить все товары
app.get('/api/products', (req, res) => {
  db.all('SELECT id, name, ingredients, image, created_at FROM products ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Добавить товар
app.post('/api/products', (req, res) => {
  const { name, ingredients, image } = req.body;
  if (!name || !ingredients || !image) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const sql = 'INSERT INTO products (name, ingredients, image) VALUES (?, ?, ?)';
  db.run(sql, [name.trim(), ingredients.trim(), image], function (err) {
    if (err) return res.status(500).json({ error: 'DB insert error' });
    db.get('SELECT id, name, ingredients, image, created_at FROM products WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: 'DB fetch error' });
      res.status(201).json(row);
    });
  });
});

// Удалить товар
app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });
  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'DB delete error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });
});

// ===== Fallback (SPA/статические страницы)
// ===== Fallback только для фронтенда, не для /api/*
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
