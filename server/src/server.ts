import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createApiRouter } from './routes/api.js';
import { telemetrySimulator } from './services/telemetrySimulator.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();

function broadcast(event: string, data: any) {
  const message = JSON.stringify({ event, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Hook up telemetry simulator to websocket broadcast
telemetrySimulator.setBroadcast(broadcast);

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.send(JSON.stringify({
    event: 'connection:established',
    data: { message: 'Connected to ResQAuto Real-Time Telemetry Stream' }
  }));

  ws.on('message', (messageRaw) => {
    try {
      const parsed = JSON.parse(messageRaw.toString());
      // Handle client incoming signals if any
      if (parsed.event === 'ping') {
        ws.send(JSON.stringify({ event: 'pong', data: { timestamp: Date.now() } }));
      }
    } catch (e) {
      // Ignore malformed message
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
});

// API Routes
app.use('/api', createApiRouter(broadcast));

app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'ResQAuto Roadside Assistance Engine',
    timestamp: new Date().toISOString(),
    activeSockets: clients.size
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚗 ResQAuto Emergency Dispatch Server Running`);
  console.log(`🌐 HTTP API: http://localhost:${PORT}/api`);
  console.log(`⚡ WebSocket Stream: ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
