const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Default interval (ms). Admin can change global/team/user settings.
let globalIntervalMs = 300000; // 5 minutes
const userIntervals = {}; // { userId: intervalMs }
const teamIntervals = {}; // { teamId: intervalMs }

// In-memory store of last-known locations: { userId: { lat, lng, timestamp, teamId } }
const lastLocations = {};

// Return effective interval given optional userId/teamId query
app.get('/api/location-update-interval', (req, res) => {
  const { userId, teamId } = req.query;
  if (userId && userIntervals[userId]) return res.json({ intervalMs: userIntervals[userId] });
  if (teamId && teamIntervals[teamId]) return res.json({ intervalMs: teamIntervals[teamId] });
  return res.json({ intervalMs: globalIntervalMs });
});

// Legacy/global setter
app.post('/api/location-update-interval', (req, res) => {
  const { intervalMs } = req.body;
  if (typeof intervalMs === 'number' && intervalMs >= 10000) {
    globalIntervalMs = intervalMs;
    return res.sendStatus(200);
  }
  return res.status(400).send('Invalid interval');
});

// Admin endpoint: set per-user or per-team interval
app.post('/api/settings', (req, res) => {
  const { scope, id, intervalMs } = req.body; // scope: 'user'|'team'
  if (!scope || !id || typeof intervalMs !== 'number' || intervalMs < 10000) {
    return res.status(400).send('Invalid settings');
  }
  if (scope === 'user') userIntervals[id] = intervalMs;
  else if (scope === 'team') teamIntervals[id] = intervalMs;
  else return res.status(400).send('Invalid scope');
  return res.sendStatus(200);
});

// Receive location posts from clients
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Load persisted data if exists, else create defaults
let persisted = {
  globalIntervalMs: 300000,
  userIntervals: {},
  teamIntervals: {},
  lastLocations: {},
  apiKey: process.env.API_KEY || 'dev-key'
};
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    persisted = Object.assign(persisted, parsed);
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(persisted, null, 2));
  }
} catch (e) {
  console.error('Failed to load data file, using defaults', e);
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(persisted, null, 2));
  } catch (e) {
    console.error('Failed to save data file', e);
  }
}

// Simple API key middleware for write endpoints
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  const validKey = process.env.API_KEY || persisted.apiKey;
  if (!key || key !== validKey) return res.status(401).send('Missing or invalid API key');
  next();
}

// Return effective interval given optional userId/teamId query
app.get('/api/location-update-interval', (req, res) => {
  const { userId, teamId } = req.query;
  if (userId && persisted.userIntervals[userId]) return res.json({ intervalMs: persisted.userIntervals[userId] });
  if (teamId && persisted.teamIntervals[teamId]) return res.json({ intervalMs: persisted.teamIntervals[teamId] });
  return res.json({ intervalMs: persisted.globalIntervalMs });
});

// Legacy/global setter (requires API key)
app.post('/api/location-update-interval', requireApiKey, (req, res) => {
  const { intervalMs } = req.body;
  if (typeof intervalMs === 'number' && intervalMs >= 10000) {
    persisted.globalIntervalMs = intervalMs;
    saveData();
    return res.sendStatus(200);
  }
  return res.status(400).send('Invalid interval');
});

// Admin endpoint: set per-user or per-team interval (requires API key)
app.post('/api/settings', requireApiKey, (req, res) => {
  const { scope, id, intervalMs } = req.body; // scope: 'user'|'team'
  if (!scope || !id || typeof intervalMs !== 'number' || intervalMs < 10000) {
    return res.status(400).send('Invalid settings');
  }
  if (scope === 'user') persisted.userIntervals[id] = intervalMs;
  else if (scope === 'team') persisted.teamIntervals[id] = intervalMs;
  else return res.status(400).send('Invalid scope');
  saveData();
  return res.sendStatus(200);
});

// Receive location posts from clients (requires API key)
app.post('/api/location', requireApiKey, (req, res) => {
  const { userId, teamId, lat, lng, timestamp } = req.body;
  if (!userId || typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).send('Invalid location payload');
  }
  persisted.lastLocations[userId] = { lat, lng, timestamp: timestamp || Date.now(), teamId };
  saveData();
  return res.sendStatus(200);
});

// Return last-known locations for all employees (public read)
app.get('/api/employee-location', (req, res) => {
  return res.json(persisted.lastLocations);
});

// Admin: rotate or set API key (requires current API key in header)
app.post('/api/admin/api-key', requireApiKey, (req, res) => {
  const { newKey } = req.body;
  if (newKey && typeof newKey === 'string') persisted.apiKey = newKey;
  else persisted.apiKey = crypto.randomBytes(16).toString('hex');
  saveData();
  return res.json({ apiKey: persisted.apiKey });
});

// Admin: create a backup snapshot of persisted data
app.post('/api/admin/backup', requireApiKey, (req, res) => {
  const backupsDir = path.join(__dirname, 'backups');
  try {
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const full = path.join(backupsDir, filename);
    fs.writeFileSync(full, JSON.stringify(persisted, null, 2));
    return res.json({ filename });
  } catch (e) {
    console.error('Backup failed', e);
    return res.status(500).send('Backup failed');
  }
});

app.listen(PORT, () => {
  console.log(`Location API server running on port ${PORT}`);
});