// index.js
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Parse request bodies ---
app.use(express.json()); // JSON payloads
app.use(express.urlencoded({ extended: true })); // form-encoded payloads

// --- Serve front-end ---
app.use(express.static(path.join(process.cwd(), 'public')));

// --- Backend routes (covers most Claude front-end paths) ---

// Create account
app.post(['/create-account', '/api/create-account', '/accounts/new'], (req, res) => {
  const { username, password } = req.body;
  console.log('Create account request:', username, password);

  // TODO: replace with real database logic
  res.json({ success: true, message: `Account for ${username} created!` });
});

// Login
app.post(['/login', '/api/login', '/accounts/login'], (req, res) => {
  const { username, password } = req.body;
  console.log('Login request:', username, password);

  // TODO: replace with real authentication
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
