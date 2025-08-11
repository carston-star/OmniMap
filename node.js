let locationUpdateIntervalMs = 60000; // Default 1 min

app.get('/api/location-update-interval', (req, res) => {
  res.json({ intervalMs: locationUpdateIntervalMs });
});

app.post('/api/location-update-interval', (req, res) => {
  const { intervalMs } = req.body;
  if (typeof intervalMs === 'number' && intervalMs >= 10000) {
    locationUpdateIntervalMs = intervalMs;
    res.sendStatus(200);
  } else {
    res.status(400).send('Invalid interval');
  }
});