const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

let currentHash = generateSecurityHash();
let currentJWTSecret = 'initial-secret-key';
let token = '';

app.use(cors());
app.use(express.json());

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'pass') {
    currentJWTSecret = generateSecurityHash();
    token = jwt.sign({ username }, currentJWTSecret, { expiresIn: '1h' });
    res.json({ success: true, token: token });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/verify-token', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, currentJWTSecret);
    res.json({ valid: true, decoded });
  } catch (e) {
    res.json({ valid: false, message: 'Invalid token' });
  }
});

let nextUpdateTime = Date.now() + 60000; // İlk güncelleme zamanını ayarla

function updateHash() {
  currentHash = generateSecurityHash();
  nextUpdateTime = Date.now() + 60000;
}

setInterval(updateHash, 30000); // Her 60 saniyede bir hash'i güncelle

app.get('/api/generate-hash', (req, res) => {
  res.json({ hash: currentHash, nextUpdate: nextUpdateTime });
});

app.get('/api/next-update-time', (req, res) => {
  res.json({ nextUpdate: nextUpdateTime });
});

app.post('/api/verify-hash', (req, res) => {
  const { hash } = req.body;
  const isValid = hash === currentHash;
  res.json({ isValid });
});


function generateSecurityHash() {
  return Math.random().toString(36).substring(2, 15);
}

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
