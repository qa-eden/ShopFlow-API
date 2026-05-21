const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('ShopFlowAPI.json');
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);

/**
 * ROOT ROUTE — interactive module explorer
 */
server.get('/', (req, res) => {
    const db = router.db.getState();
    const modules = Object.keys(db);

    const resourceLinks = modules.map(m => {
        const count = Array.isArray(db[m]) ? db[m].length : '?';
        return `<li><a href="#" onclick="loadModule('${m}'); return false;">/api/${m}</a> <sup>${count}x</sup></li>`;
    }).join('\n          ');

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>ShopFlow JSON Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 32px; }
    header h1 { font-size: 20px; font-weight: 700; }
    nav a { margin-left: 20px; font-size: 14px; color: #e74c3c; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
    h2 { font-size: 22px; font-weight: 700; margin: 28px 0 10px; }
    p  { color: #555; font-size: 15px; margin: 4px 0; }
    ul { list-style: none; padding: 0; margin: 12px 0 24px; }
    ul li { margin: 6px 0; font-size: 15px; }
    ul li a { color: #2980b9; text-decoration: none; }
    ul li a:hover { text-decoration: underline; }
    ul li sup { color: #888; font-size: 11px; }
    .methods span { display: inline-block; border: 1px solid #ccc; border-radius: 4px; padding: 2px 8px; font-size: 12px; margin-right: 6px; color: #555; }
    #viewer { display: none; margin-top: 32px; }
    #viewer h3 { font-size: 18px; margin-bottom: 10px; }
    #viewer h3 span { font-family: monospace; color: #2980b9; }
    #json-output { background: #1e1e2e; color: #cdd6f4; border-radius: 8px; padding: 20px; font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace; font-size: 13px; line-height: 1.7; overflow-x: auto; white-space: pre; max-height: 500px; overflow-y: auto; }
    .j-key { color: #89b4fa; } .j-str { color: #a6e3a1; } .j-num { color: #fab387; } .j-bool { color: #cba6f7; } .j-null { color: #f38ba8; }
    #back-btn { margin-top: 10px; font-size: 13px; color: #888; background: none; border: none; cursor: pointer; padding: 0; }
    #back-btn:hover { color: #2980b9; text-decoration: underline; }
  </style>
</head>
<body>
<header>
  <h1>ShopFlow JSON Server</h1>
  <nav>
    <a href="https://github.com/sponsors/typicode" target="_blank">&#9829; GitHub Sponsors</a>
    <a href="https://my-json-server.typicode.com" target="_blank">&#128293; My JSON Server</a>
    <a href="https://opencollective.com/json-server" target="_blank">&#128515; Supporters</a>
  </nav>
</header>
<div id="home-view">
  <h2>Congrats!</h2>
  <p>You're successfully running ShopFlow JSON Server</p>
  <p>&#9672;*.&#9633;(&#180;&#9633;\`*)&#9633;&#9672;*.</p>
  <h2>Resources</h2>
  <ul>${resourceLinks}</ul>
  <p>To access and modify resources, you can use any HTTP method:</p>
  <p class="methods" style="margin-top:8px;">
    <span>GET</span><span>POST</span><span>PUT</span><span>PATCH</span><span>DELETE</span><span>OPTIONS</span>
  </p>
</div>
<div id="viewer">
  <button id="back-btn" onclick="goBack()">&#8592; Back to Resources</button>
  <h3>/<span id="viewer-title"></span></h3>
  <div id="json-output"></div>
</div>
<script>
  function syntaxHighlight(json) {
    json = json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(m){
      if(/^"/.test(m)) return /:$/.test(m) ? '<span class="j-key">'+m+'</span>' : '<span class="j-str">'+m+'</span>';
      if(/true|false/.test(m)) return '<span class="j-bool">'+m+'</span>';
      if(/null/.test(m)) return '<span class="j-null">'+m+'</span>';
      return '<span class="j-num">'+m+'</span>';
    });
  }
  function loadModule(name) {
    document.getElementById('json-output').innerHTML = 'Loading...';
    document.getElementById('viewer-title').textContent = 'api/' + name;
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('viewer').style.display = 'block';
    fetch('/api/' + name).then(r => r.json()).then(data => {
      document.getElementById('json-output').innerHTML = syntaxHighlight(JSON.stringify(data, null, 2));
    }).catch(() => { document.getElementById('json-output').textContent = 'Error loading data.'; });
  }
  function goBack() {
    document.getElementById('viewer').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
  }
</script>
</body>
</html>`);
});

/* ═══════════════════════════════════════════════════════════════
   USERS — POST /api/users
   Validations: name (required, min 3), email (required, format,
   unique), phone (format if provided), role (customer|admin)
═══════════════════════════════════════════════════════════════ */
server.post('/api/users', (req, res, next) => {
    const users = router.db.get('users').value();
    const { name, email, phone, role } = req.body;

    if (!name || name.trim() === '')
        return res.status(400).json({ error: 'Name is required' });
    if (name.length < 3)
        return res.status(400).json({ error: 'Name must be at least 3 characters' });
    if (!email || email.trim() === '')
        return res.status(400).json({ error: 'Email is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ error: 'Invalid email format' });
    if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()))
        return res.status(400).json({ error: 'Email already exists' });
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone))
        return res.status(400).json({ error: 'Invalid phone number' });
    if (role && !['customer', 'admin'].includes(role))
        return res.status(400).json({ error: 'Invalid role' });

    next();
});

/* ═══════════════════════════════════════════════════════════════
   PRODUCTS — POST /api/products
   Validations: name (required), price (required, > 0),
   categoryId (required, 1–5), stock (required, >= 0),
   status (active|out_of_stock if provided)
═══════════════════════════════════════════════════════════════ */
server.post('/api/products', (req, res, next) => {
    const { name, price, categoryId, stock, status } = req.body;

    if (!name || name.trim() === '')
        return res.status(400).json({ error: 'Product name is required' });
    if (price === undefined || price === null)
        return res.status(400).json({ error: 'Price is required' });
    if (typeof price !== 'number' || price <= 0)
        return res.status(400).json({ error: 'Price must be a positive number' });
    if (categoryId === undefined || categoryId === null)
        return res.status(400).json({ error: 'categoryId is required' });
    if (![1, 2, 3, 4, 5].includes(Number(categoryId)))
        return res.status(400).json({ error: 'categoryId must be between 1 and 5' });
    if (stock === undefined || stock === null)
        return res.status(400).json({ error: 'Stock is required' });
    if (typeof stock !== 'number' || stock < 0)
        return res.status(400).json({ error: 'Stock must be 0 or greater' });
    if (status && !['active', 'out_of_stock'].includes(status))
        return res.status(400).json({ error: 'Status must be active or out_of_stock' });

    next();
});

/* ═══════════════════════════════════════════════════════════════
   ORDERS — POST /api/orders
   Validations: userId (required, must exist), items (required,
   non-empty array), paymentMethod (card|bank_transfer|cash),
   status (pending|processing|shipped|delivered)
═══════════════════════════════════════════════════════════════ */
server.post('/api/orders', (req, res, next) => {
    const users = router.db.get('users').value();
    const { userId, items, paymentMethod, status } = req.body;

    if (userId === undefined || userId === null)
        return res.status(400).json({ error: 'userId is required' });
    if (!users.find(u => u.id === Number(userId)))
        return res.status(400).json({ error: 'User not found' });
    if (!items)
        return res.status(400).json({ error: 'Items are required' });
    if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: 'Order must contain at least one item' });
    if (paymentMethod && !['card', 'bank_transfer', 'cash'].includes(paymentMethod))
        return res.status(400).json({ error: 'Invalid payment method' });
    if (status && !['pending', 'processing', 'shipped', 'delivered'].includes(status))
        return res.status(400).json({ error: 'Invalid order status' });

    next();
});

/* ═══════════════════════════════════════════════════════════════
   REVIEWS — POST /api/reviews
   Validations: productId (required), userId (required),
   rating (required, 1–5), title (required),
   body (required, min 10 chars)
═══════════════════════════════════════════════════════════════ */
server.post('/api/reviews', (req, res, next) => {
    const { productId, userId, rating, title, body } = req.body;

    if (productId === undefined || productId === null)
        return res.status(400).json({ error: 'productId is required' });
    if (userId === undefined || userId === null)
        return res.status(400).json({ error: 'userId is required' });
    if (rating === undefined || rating === null)
        return res.status(400).json({ error: 'Rating is required' });
    if (typeof rating !== 'number' || rating < 1 || rating > 5)
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    if (!title || title.trim() === '')
        return res.status(400).json({ error: 'Title is required' });
    if (!body || body.trim() === '')
        return res.status(400).json({ error: 'Body is required' });
    if (body.trim().length < 10)
        return res.status(400).json({ error: 'Review body must be at least 10 characters' });

    next();
});

/* ═══════════════════════════════════════════════════════════════
   CARTS — POST /api/carts
   Validations: userId (required), items (required, array),
   each item must have productId and quantity >= 1
═══════════════════════════════════════════════════════════════ */
server.post('/api/carts', (req, res, next) => {
    const { userId, items } = req.body;

    if (userId === undefined || userId === null)
        return res.status(400).json({ error: 'userId is required' });
    if (!items)
        return res.status(400).json({ error: 'Items are required' });
    if (!Array.isArray(items))
        return res.status(400).json({ error: 'Items must be an array' });

    for (const item of items) {
        if (!item.productId)
            return res.status(400).json({ error: 'Each item must have a productId' });
        if (item.quantity === undefined || item.quantity < 1)
            return res.status(400).json({ error: 'Item quantity must be at least 1' });
    }

    next();
});

/* ═══════════════════════════════════════════════════════════════
   COUPONS — POST /api/coupons
   Validations: code (required, unique), type (percentage|fixed),
   value (required, > 0; percentage <= 100), active (boolean)
═══════════════════════════════════════════════════════════════ */
server.post('/api/coupons', (req, res, next) => {
    const coupons = router.db.get('coupons').value();
    const { code, type, value, active } = req.body;

    if (!code || code.trim() === '')
        return res.status(400).json({ error: 'Coupon code is required' });
    if (coupons.find(c => c.code && c.code.toUpperCase() === code.toUpperCase()))
        return res.status(400).json({ error: 'Coupon code already exists' });
    if (!type || type.trim() === '')
        return res.status(400).json({ error: 'Coupon type is required' });
    if (!['percentage', 'fixed'].includes(type))
        return res.status(400).json({ error: 'Coupon type must be percentage or fixed' });
    if (value === undefined || value === null)
        return res.status(400).json({ error: 'Coupon value is required' });
    if (typeof value !== 'number' || value <= 0)
        return res.status(400).json({ error: 'Coupon value must be a positive number' });
    if (type === 'percentage' && value > 100)
        return res.status(400).json({ error: 'Percentage value cannot exceed 100' });
    if (active !== undefined && typeof active !== 'boolean')
        return res.status(400).json({ error: 'Active must be a boolean' });

    next();
});

/* ═══════════════════════════════════════════════════════════════
   ROUTER — must be last
═══════════════════════════════════════════════════════════════ */
server.use(middlewares);
server.use('/api', router);

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`\n  \\{^_^}/ hi!\n`);
    console.log(`  Loading ShopFlowAPI.json`);
    console.log(`  Done\n`);
    console.log(`  Resources`);
    const db = require('./ShopFlowAPI.json');
    Object.keys(db).forEach(k => console.log(`  http://localhost:${PORT}/api/${k}`));
    console.log(`\n  Home`);
    console.log(`  http://localhost:${PORT}\n`);
});