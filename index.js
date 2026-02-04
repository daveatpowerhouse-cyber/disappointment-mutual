// index.js
import express from 'express';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // allow front-end from any origin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve front-end ---
app.use(express.static(path.join(process.cwd(), 'public')));

// --- In-memory storage (for testing) ---
const users = {}; // { username: { password, balance: {}, orders: [] } }
const orders = []; // global orders
const trades = []; // trade history

// --- Helper Functions ---
const getUser = (username) => users[username];

// --- API Routes ---

// Register new user
app.post(['/api/register'], (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });
  if (users[username])
    return res.status(400).json({ error: 'Username already exists' });

  users[username] = {
    password,
    balance: { USDT: 1000, BTC: 0, ETH: 0, SOL: 0, BNB: 0, ADA: 0, XRP: 0, DOGE: 0, DOT: 0 },
    orders: [],
    isAdmin: username === 'admin'
  };

  console.log('Registered user:', username);
  res.json({ success: true, user: { username, balance: users[username].balance, isAdmin: users[username].isAdmin } });
});

// Login
app.post(['/api/login'], (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const user = users[username];
  if (!user || user.password !== password)
    return res.status(401).json({ error: 'Invalid username or password' });

  res.json({ success: true, user: { username, balance: user.balance, isAdmin: user.isAdmin } });
});

// Get user info
app.get(['/api/user/:username'], (req, res) => {
  const { username } = req.params;
  const user = users[username];
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ user: { username, balance: user.balance, orders: user.orders, isAdmin: user.isAdmin } });
});

// Place order
app.post(['/api/orders'], (req, res) => {
  const { username, pair, type, side, price, amount } = req.body;
  const user = users[username];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newOrder = {
    id: Date.now() + Math.random(),
    username,
    pair,
    type,
    side,
    price,
    amount,
    filled: 0,
    status: 'open',
    created_at: new Date().toISOString()
  };

  user.orders.push(newOrder);
  orders.push(newOrder);

  res.json({ success: true, order: newOrder });
});

// Cancel order
app.post(['/api/orders/:id/cancel'], (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  const user = users[username];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const order = orders.find(o => o.id == id && o.username === username);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = 'cancelled';
  res.json({ success: true });
});

// Get all orders
app.get(['/api/orders'], (req, res) => {
  const { pair, status } = req.query;
  let result = orders;

  if (pair) result = result.filter(o => o.pair === pair);
  if (status) result = result.filter(o => o.status === status);

  res.json({ orders: result });
});

// Get trades
app.get(['/api/trades'], (req, res) => {
  const { pair, limit = 50 } = req.query;
  let result = trades;
  if (pair) result = result.filter(t => t.pair === pair);
  res.json({ trades: result.slice(-limit) });
});

// Admin: list all users
app.get(['/api/admin/users'], (req, res) => {
  const allUsers = Object.entries(users).map(([username, data]) => ({
    id: username,
    username,
    balance: data.balance,
    isAdmin: data.isAdmin
  }));
  res.json({ users: allUsers });
});

// --- SPA fallback ---
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'), (err) => {
    if (err) res.status(500).send(err);
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
