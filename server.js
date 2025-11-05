// server.js — BAMA Smoothies (API + Auth)
// ---------------------------------------
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret-change-me';

// ---------- Security & parsers ----------
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      // ⬇️ разрешаем исходящие XHR/fetch к remove.bg
      "connect-src": ["'self'", "https:", "https://api.remove.bg"],
      "frame-ancestors": ["'self'"]
    }
  }
}));

app.use(cors({
  origin: true,          // если у тебя будет другой домен фронта — укажи сюда строкой
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Лимитер только на попытки логина
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

// ---------- Static ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- DB ----------
const DB_FILE = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_FILE);

// Инициализация схемы и сидов
db.serialize(() => {
  // Товары
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      image TEXT NOT NULL,     -- можно хранить URL или dataURL (base64)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Пользователи (админы)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Заказы
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    address TEXT NOT NULL,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )
`);

  // Сидим продукты из public/data.json, если пусто
  db.get('SELECT COUNT(*) AS cnt FROM products', (err, row) => {
    if (err) return console.error(err);
    if (row && row.cnt === 0) {
      const dataPath = path.join(__dirname, 'public', 'data.json');
      if (fs.existsSync(dataPath)) {
        try {
          const raw = fs.readFileSync(dataPath, 'utf8');
          const json = JSON.parse(raw);
          const smoothies = Array.isArray(json.smoothies) ? json.smoothies : [];
          if (smoothies.length) {
            const stmt = db.prepare('INSERT INTO products (name, ingredients, image) VALUES (?, ?, ?)');
            smoothies.forEach(s => stmt.run(s.name, s.ingredients, s.image));
            stmt.finalize();
            console.log(`✅ Seeded ${smoothies.length} products from data.json`);
          }
        } catch (e) {
          console.warn('⚠️ Could not seed from data.json:', e.message);
        }
      }
    }
  });

  // Создаём админа из .env, если его нет
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    db.get('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL], async (err, row) => {
      if (err) return console.error('users seed error:', err);
      if (!row) {
        try {
          const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
          db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [ADMIN_EMAIL, hash]);
          console.log(`👤 Admin user created: ${ADMIN_EMAIL}`);
        } catch (e) {
          console.error('admin seed hash error:', e);
        }
      }
    });
  }
});

// ---------- Auth helpers ----------
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// ---------- AUTH routes ----------
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: row.id, email: row.email });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',   // stricter при необходимости
      secure: false      // true на HTTPS
    });
    res.json({ ok: true, email: row.email });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ authenticated: false });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true, email: user.email });
  } catch {
    res.json({ authenticated: false });
  }
});

// ---------- PRODUCTS API ----------
/** Публичный список товаров */
app.get('/api/products', (req, res) => {
  db.all('SELECT id, name, ingredients, image, created_at FROM products ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

/** Создание товара — только админ (нужна cookie-сессия) */
app.post('/api/products', authRequired, (req, res) => {
  const { name, ingredients, image } = req.body || {};
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

/** Удаление товара — только админ */
app.delete('/api/products/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });
  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'DB delete error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });
});

// === ORDERS API ===

// создать заказ (публично)
app.post('/api/orders', (req, res) => {
  const {
    productId,      // опционально (если знаешь id)
    product,        // обязательное название (product_name)
    name,           // customer_name
    email,
    phone,
    quantity,
    address,
    comments
  } = req.body || {};

  if (!product || !name || !email || !phone || !quantity || !address) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const q = `
    INSERT INTO orders (product_id, product_name, customer_name, email, phone, quantity, address, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(q, [
    Number.isInteger(productId) ? productId : null,
    String(product),
    String(name),
    String(email),
    String(phone),
    Number(quantity),
    String(address),
    comments ? String(comments) : null
  ], function (err) {
    if (err) return res.status(500).json({ error: 'DB insert error' });
    db.get('SELECT * FROM orders WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: 'DB fetch error' });
      res.status(201).json(row);
    });
  });
});

// получить все заказы (только админ)
app.get('/api/orders', authRequired, (req, res) => {
  db.all(`
    SELECT id, product_id, product_name, customer_name, email, phone, quantity, address, comments, created_at
    FROM orders
    ORDER BY created_at DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// удалить заказ (только админ)
app.delete('/api/orders/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });
  db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'DB delete error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });
});


// ---------- Fallback (Express v5 дружелюбный) ----------
/**
 * ВАЖНО: в Express 5 нельзя использовать '*', используем '/*' или regexp,
 * и не перехватываем /api/*
 */
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
