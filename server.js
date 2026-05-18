const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('ShopFlowAPI.json');
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);

/**
 * ROOT ROUTE — mimics json-server UI but with clickable resource links
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
    .methods span {
      display: inline-block; border: 1px solid #ccc; border-radius: 4px;
      padding: 2px 8px; font-size: 12px; margin-right: 6px; color: #555;
    }

    /* JSON viewer */
    #viewer { display: none; margin-top: 32px; }
    #viewer h3 { font-size: 18px; margin-bottom: 10px; }
    #viewer h3 span { font-family: monospace; color: #2980b9; }
    #json-output {
      background: #1e1e2e; color: #cdd6f4;
      border-radius: 8px; padding: 20px;
      font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
      font-size: 13px; line-height: 1.7;
      overflow-x: auto; white-space: pre;
      max-height: 500px; overflow-y: auto;
    }
    .j-key  { color: #89b4fa; }
    .j-str  { color: #a6e3a1; }
    .j-num  { color: #fab387; }
    .j-bool { color: #cba6f7; }
    .j-null { color: #f38ba8; }
    #back-btn {
      margin-top: 10px; font-size: 13px; color: #888;
      background: none; border: none; cursor: pointer; padding: 0;
    }
    #back-btn:hover { color: #2980b9; text-decoration: underline; }
  </style>
</head>
<body>

<header>
  <h1>JSON Server</h1>
  <nav>
    <a href="https://github.com/sponsors/typicode" target="_blank">&#9829; GitHub Sponsors</a>
    <a href="https://my-json-server.typicode.com" target="_blank">&#128293; My JSON Server</a>
    <a href="https://opencollective.com/json-server" target="_blank">&#128515; Supporters</a>
  </nav>
</header>

<div id="home-view">
  <h2>Congrats!</h2>
  <p>You're successfully running ShopFlow JSON Server</p>
  <p>&#9672;*.&#9633;(´&#9633;\`*)&#9633;&#9672;*.</p>

  <h2>Resources</h2>
  <ul>
    ${resourceLinks}
  </ul>

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
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        if (/^"/.test(match)) {
          return /:$/.test(match)
            ? '<span class="j-key">' + match + '</span>'
            : '<span class="j-str">' + match + '</span>';
        }
        if (/true|false/.test(match)) return '<span class="j-bool">' + match + '</span>';
        if (/null/.test(match))       return '<span class="j-null">' + match + '</span>';
        return '<span class="j-num">' + match + '</span>';
      }
    );
  }

  function loadModule(name) {
    document.getElementById('json-output').innerHTML = 'Loading...';
    document.getElementById('viewer-title').textContent = 'api/' + name;
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('viewer').style.display = 'block';

    fetch('/api/' + name)
      .then(r => r.json())
      .then(data => {
        const pretty = JSON.stringify(data, null, 2);
        document.getElementById('json-output').innerHTML = syntaxHighlight(pretty);
      })
      .catch(() => {
        document.getElementById('json-output').textContent = 'Error loading data.';
      });
  }

  function goBack() {
    document.getElementById('viewer').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
  }
</script>

</body>
</html>`);
});

/**
 * CUSTOM USER VALIDATION
 */
server.post('/api/users', (req, res, next) => {
    const users = router.db.get('users').value();
    const { name, email, phone, role } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || email.trim() === '') {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (name.length < 3) {
        return res.status(400).json({ error: 'Name must be at least 3 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = users.find(
        u => u.email && u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    if (phone) {
        const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }
    }

    const allowedRoles = ['customer', 'admin'];
    if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    next();
});

/**
 * ROUTER MUST BE LAST
 */
server.use(middlewares);
server.use('/api', router);

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`ShopFlow API running on port ${PORT}`);
    console.log(`\n  \\{^_^}/ hi!\n`);
    console.log(`  Loading ShopFlowAPI.json`);
    console.log(`  Done\n`);
    console.log(`  Resources`);
    const db = require('./ShopFlowAPI.json');
    Object.keys(db).forEach(k => console.log(`  http://localhost:${PORT}/api/${k}`));
    console.log(`\n  Home`);
    console.log(`  http://localhost:${PORT}`);
});