const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const JWT_SECRET = 'supersecretkey';
const PORT = 3001;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://localhost:27017/infravisor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const DeviceSchema = new mongoose.Schema({deviceId: String, stats: Object, lastSeen: Date, logs: [String]});

const Device = mongoose.model('Device', DeviceSchema);

app.use(cors({origin: 'http://localhost:5173',credentials: true}));

app.use(bodyParser.json());

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(403).send('Forbidden');
  }
});


app.get('/api/devices', authenticate, async (req, res) => {
  const devices = await Device.find();
  res.json(devices);
});


wss.on('connection', ws => {
  let deviceId = null;

  ws.on('message', async message => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'auth') {
        const decoded = jwt.verify(data.token, JWT_SECRET);
        deviceId = decoded.deviceId;
        console.log(`Device ${deviceId} connected`);
      }

      if (data.type === 'stats' && deviceId) {
      console.log("Stats from", deviceId, data.stats);
        await Device.findOneAndUpdate(
          { deviceId },
          { stats: data.stats, lastSeen: new Date() },
          { upsert: true }
        );
      }

      if (data.type === 'log' && deviceId) {
        await Device.findOneAndUpdate(
          { deviceId },
          { $push: { logs: { $each: [data.log], $slice: -500 } } }
        );
      }
    } catch (err) {
      console.error(err);
    }
  });
});

server.listen(PORT, () => console.log(`InfraVisor backend running on http://localhost:${PORT}`));
