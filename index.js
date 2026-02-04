// index.js test
import express from 'express';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- STATIC FRONTEND ----------------
// Use process.cwd() since __dirname doesn't exist in ES modules
app.use(express.static(path.join(process.cwd(), 'public')));

// ---------------- IN-MEMORY DATA ----------------
const users = {};
const orders = [];
const trades = [];

// Fake live prices
let prices = {
  BTCUSDT: 43000,
  ETHUSDT: 2300,
  SOLUSDT: 98,
  BNBUSDT: 320,
  ADAUSDT: 0.48,
  XRPUSDT: 0.62,
  DOGEUSDT: 0.078,
  DOTUSDT: 7.1,
  AVAXUSDT: 36
};

// Simulate market movement
setInterval(() => {
  Object.keys(prices).forEach(pair => {
    const change = (Math.random() - 0.5) * 0.5;
    prices[pair] = Math.max(0.0001, prices[pair] + change);
  });
}, 1500);

// ---------------- AUTH ----------------
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users[username]) return res.status(400).json({ error: 'User exists' });

  users[username] = {
    password,
    balance: { USDT: 1000, BTC: 0, ETH: 0, SOL: 0, BNB: 0, ADA: 0, XRP: 0, DOGE: 0, DOT: 0 },
    orders: []
  };

  res.json({ success: true, user: { username, balance: users[username].balance } });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: { username, balance: user.balance } });
});

// ---------------- CORE EXCHANGE ENDPOINTS ----------------
app.get('/api/balance', (req, res) => {
  const { username } = req.query;
  if (!users[username]) return res.json({ USDT: 0 });
  res.json(users[username].balance);
});

app.get('/api/prices', (req, res) => {
  res.json(prices);
});

app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

app.get('/api/orderbook', (req, res) => {
  const { pair } = req.query;
  const bids = orders
    .filter(o => o.pair === pair && o.side === 'buy' && o.status === 'open')
    .sort((a, b) => b.price - a.price);
  const asks = orders
    .filter(o => o.pair === pair && o.side === 'sell' && o.status === 'open')
    .sort((a, b) => a.price - b.price);
  res.json({ bids, asks });
});

app.get('/api/trades', (req, res) => {
  res.json({ trades: trades.slice(-50) });
});

app.post('/api/orders', (req, res) => {
  const { username, pair, side, price, amount } = req.body;
  if (!users[username]) return res.status(400).json({ error: 'User not found' });

  const order = {
    id: Date.now(),
    username,
    pair,
    side,
    price,
    amount,
    status: 'open',
    created: new Date().toISOString()
  };

  orders.push(order);
  users[username].orders.push(order);
  trades.push({ pair, price, amount, side, time: Date.now() });

  res.json({ success: true, order });
});

// ---------------- SPA FALLBACK ----------------
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// ---------------- START ----------------
app.listen(PORT, () => {
  console.log(`🚀 Exchange running on port ${PORT}`);
});
