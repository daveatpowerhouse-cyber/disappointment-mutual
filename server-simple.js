// Disappointment Mutual Exchange - Single File Server
// Starts HTTP server IMMEDIATELY, then initializes everything else

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// START SERVER IMMEDIATELY
// ============================================
const server = app.listen(PORT, () => {
  console.log(`🚀 Disappointment Mutual Exchange running on port ${PORT}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  // Initialize everything else AFTER server starts
  initializeEverything();
});

// Middleware - Configure BEFORE routes
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// IN-MEMORY STORAGE (No Database Needed!)
// ============================================
let USERS = {};
let ORDERS = [];
let TRADES = [];

// ============================================
// ASYNC INITIALIZATION
// ============================================
async function initializeEverything() {
  console.log('⏳ Initializing Disappointment Mutual Exchange...');
  
  // Create admin user
  USERS['admin'] = {
    id: 1,
    username: 'admin',
    password: 'superadmin123', // Plain text is fine for fake money
    isAdmin: true,
    balance: {
      BTC: 1000,
      ETH: 5000,
      USDT: 10000000,
      SOL: 50000,
      BNB: 10000,
      ADA: 1000000,
      XRP: 5000000,
      DOGE: 10000000,
      DOT: 100000
    }
  };

  // Start order matching
  setInterval(matchOrders, 2000);
  
  console.log('✅ Exchange initialized!');
  console.log('👤 Admin account ready: admin / superadmin123');
}

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Disappointment Mutual Exchange</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #0b0e11;
          color: white;
          text-align: center;
        }
        .status { color: #0ecb81; font-size: 24px; margin: 20px 0; }
        .info { background: #181a20; padding: 20px; border-radius: 10px; margin: 20px 0; }
        a { color: #f0b90b; text-decoration: none; font-size: 20px; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>💔 Disappointment Mutual Exchange</h1>
      <div class="status">✅ Server is running!</div>
      <div class="info">
        <p><strong>Total Users:</strong> ${Object.keys(USERS).length}</p>
        <p><strong>Active Orders:</strong> ${ORDERS.filter(o => o.status === 'open').length}</p>
        <p><strong>Trades Executed:</strong> ${TRADES.length}</p>
      </div>
      <a href="/index.html">🚀 Open Exchange</a>
    </body>
    </html>
  `);
});

// Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (USERS[username]) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const userId = Object.keys(USERS).length + 1;
  
  USERS[username] = {
    id: userId,
    username,
    password,
    isAdmin: false,
    balance: {
      BTC: 10,
      ETH: 50,
      USDT: 100000,
      SOL: 500,
      BNB: 100,
      ADA: 10000,
      XRP: 50000,
      DOGE: 100000,
      DOT: 1000
    }
  };

  res.json({
    success: true,
    user: {
      id: userId,
      username,
      isAdmin: false,
      balance: USERS[username].balance
    }
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = USERS[username];
  if (!user || user.password !== password) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      balance: user.balance
    }
  });
});

// Get user data
app.get('/api/user/:username', (req, res) => {
  const user = USERS[req.params.username];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userOrders = ORDERS.filter(o => o.username === req.params.username);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      balance: user.balance,
      orders: userOrders
    }
  });
});

// Place order
app.post('/api/orders', (req, res) => {
  const { username, pair, type, side, price, amount } = req.body;

  const user = USERS[username];
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  const baseCoin = pair.replace('USDT', '');
  
  // Check balance
  if (side === 'buy') {
    if (user.balance.USDT < amount * price) {
      return res.status(400).json({ error: 'Insufficient USDT balance' });
    }
  } else {
    if (user.balance[baseCoin] < amount) {
      return res.status(400).json({ error: `Insufficient ${baseCoin} balance` });
    }
  }

  const order = {
    id: ORDERS.length + 1,
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

  ORDERS.push(order);

  res.json({ success: true, orderId: order.id });
});

// Get orders
app.get('/api/orders', (req, res) => {
  const { pair, status } = req.query;
  
  let filtered = ORDERS;
  
  if (pair) {
    filtered = filtered.filter(o => o.pair === pair);
  }
  
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }
  
  res.json({ orders: filtered });
});

// Cancel order
app.post('/api/orders/:id/cancel', (req, res) => {
  const { username } = req.body;
  const order = ORDERS.find(o => o.id === parseInt(req.params.id));

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.username !== username) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  order.status = 'cancelled';
  res.json({ success: true });
});

// Get trades
app.get('/api/trades', (req, res) => {
  const { pair, limit = 50 } = req.query;
  
  let filtered = TRADES;
  
  if (pair) {
    filtered = filtered.filter(t => t.pair === pair);
  }
  
  const limited = filtered.slice(0, parseInt(limit));
  res.json({ trades: limited });
});

// Admin: Get all users
app.get('/api/admin/users', (req, res) => {
  const users = Object.values(USERS).map(u => ({
    id: u.id,
    username: u.username,
    isAdmin: u.isAdmin,
    balance: u.balance
  }));
  
  res.json({ users });
});

// ============================================
// ORDER MATCHING ENGINE
// ============================================
function matchOrders() {
  const openOrders = ORDERS.filter(o => o.status === 'open');
  
  openOrders.forEach((order, idx) => {
    // Find matching orders
    const matches = openOrders.filter((o, i) => 
      i !== idx &&
      o.pair === order.pair &&
      o.side !== order.side &&
      o.username !== order.username &&
      ((order.side === 'buy' && o.price <= order.price) ||
       (order.side === 'sell' && o.price >= order.price))
    );

    matches.forEach(match => {
      const fillAmount = Math.min(
        order.amount - order.filled,
        match.amount - match.filled
      );

      if (fillAmount > 0) {
        const fillPrice = match.price;
        
        // Update fills
        order.filled += fillAmount;
        match.filled += fillAmount;

        if (order.filled >= order.amount) order.status = 'filled';
        if (match.filled >= match.amount) match.status = 'filled';

        // Update balances
        const baseCoin = order.pair.replace('USDT', '');
        const buyer = USERS[order.side === 'buy' ? order.username : match.username];
        const seller = USERS[order.side === 'sell' ? order.username : match.username];

        buyer.balance[baseCoin] += fillAmount;
        buyer.balance.USDT -= fillAmount * fillPrice;
        seller.balance[baseCoin] -= fillAmount;
        seller.balance.USDT += fillAmount * fillPrice;

        // Record trade
        TRADES.unshift({
          id: TRADES.length + 1,
          pair: order.pair,
          price: fillPrice,
          amount: fillAmount,
          type: order.side,
          buyer: buyer.username,
          seller: seller.username,
          created_at: new Date().toISOString()
        });
      }
    });
  });
}

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
