// index.js
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Parse request bodies ---
app.use(express.json()); // JSON payloads
app.use(express.urlencoded({ extended: true })); // form-encoded payloads

// --- In-memory storage for testing ---
const users = {}; // { username: password }

// --- Serve front-end ---
app.use(express.static(path.join(process.cwd(), 'public')));

// --- Backend routes (Claude-compatible) ---

// Create account
app.post(['/create-account', '/api/create-account', '/accounts/new'], (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  if (users[username]) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }
  users[username] = password;
  console.log('Account created:', username);
  res.json({ success: true, message: `Account for ${username} created!` });
});

// Login
app.post(['/login', '/api/login', '/accounts/login'], (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  if (users[username] !== password) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
  console.log('Login successful:', username);
  res.json({ success: true, message: `Logged in as ${username}` });
});

// Get crypto prices
app.get(['/prices', '/api/prices'], (req, res) => {
  res.json({
    BTC: 28000,
    ETH: 1800,
    USDT: 1
  });
});

// --- SPA fallback for front-end routing ---
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'), (err) => {
    if (err) res.status(500).send(err);
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
