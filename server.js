// server.js
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DBPATH = path.join(__dirname, 'data.json');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const STAFF_INVITE = process.env.STAFF_INVITE || 'rfrp-invite-2025';

async function readDb() { return fs.readJson(DBPATH); }
async function writeDb(d) { return fs.writeJson(DBPATH, d, { spaces: 2 }); }

// --- Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, invite } = req.body;
    if (!username || !password || !invite) return res.status(400).json({ message: 'Missing fields' });
    if (invite !== STAFF_INVITE) return res.status(403).json({ message: 'Invalid invite code' });

    const db = await readDb();
    if (db.staff.find(s => s.username === username)) return res.status(409).json({ message: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    db.staff.push({ id: Date.now().toString(), username, password: hash });
    await writeDb(db);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing' });
    const db = await readDb();
    const user = db.staff.find(s => s.username === username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// --- Middleware auth
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ message: 'No token' });
  const parts = h.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Bad token' });
  const token = parts[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data; next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// --- Status routes
app.get('/api/status', async (req, res) => {
  try {
    const db = await readDb();
    return res.json(db.status || {});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/status', authMiddleware, async (req, res) => {
  try {
    const { server, bot, applications, message } = req.body;
    const db = await readDb();
    db.status = Object.assign(db.status || {}, {
      server: server ?? db.status.server,
      bot: bot ?? db.status.bot,
      applications: applications ?? db.status.applications,
      message: message ?? db.status.message ?? ''
    });
    await writeDb(db);
    return res.json({ ok: true, status: db.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// --- Fallback to index (for simple SPA navigation)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`RFRP site running on http://localhost:${PORT}`));
