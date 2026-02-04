// index.js
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies from requests
app.use(express.json());

// --- Serve front-end ---
app.use(express.static(path.join(process.cwd(), 'public')));

// --- Backend routes matching Claude front-end ---
// Replace these with real logic if Claude provided any

// Create account
app.post('/create-account', (req, res) => {
  const { username, password } = req.body;
  console.log('Create account request:', username, password);
  // TODO: replace with database logic
  res.json({ success: true, message: `Account for ${username} created!` });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login request:', username, password);
  // TODO: replace with database check
  res.json({ success: true, message: `Logged in as ${username}` });
});

// Get crypto prices
app.get('/prices', (req, res) => {
  // TODO: replace with real prices or API calls
  res.json({
    BTC: 28000,
    ETH: 1800,
    USDT: 1
  });
});

// SPA fallback for front-end routing
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'), (err) => {
    if (err) res.status(500).send(err);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
