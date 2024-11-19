import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { jwtConfig } from './utils.js';

let wss;

export const initWss = (server) => {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const { type, payload } = JSON.parse(message);
        const { token } = payload;
        ws.user = jwt.verify(token, jwtConfig.secret);
      } catch (err) {
        ws.close();
      }
    });
  });
};

export const broadcast = (userId, data) => {
  if (!wss) {
    return;
  }
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && Number(userId) === Number(client.user._id)) {
      console.log(`broadcast sent to ${client.user.username}`);
      client.send(JSON.stringify(data));
    }
  });
};