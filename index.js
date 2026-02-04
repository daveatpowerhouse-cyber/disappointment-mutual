// index.js
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// --- Serve front-end ---
app.use(express.static(path.join(process.cwd(), 'public')));

// --- Backend routes (from server-simple.js) ---
// Replace these with your actual server-simple logic if needed

// Example: create account
app.post('/api/create-account', (req, res) => {
  const { username, password } = req.body;
  // TODO: replace with real account creation logic
  console.log('Create account request:', username, password);
  res.json({ success: true, message: `Account for ${username} created!` });
});

// Example: login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // TODO: replace with real login logic
  console.log('Login request:', username, password);
  res.json({ success: true, message: `Logged in as ${username}` });
});

// Example: fetch crypto prices
app.get('/api/prices', (req, res) => {
  // TODO: replace with real price logic or API calls
  res.json({
    BTC: 28000,
    ETH: 1800,
    USDT: 1,
  });
});

// --- SPA fallback for front-end routing ---
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'), (err) => {
    if (err) res.status(500).send(err);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
