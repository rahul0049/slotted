

import { Router } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt.js';
import 'dotenv/config';

const router = Router();
const QUEUE_ENGINE_URL = process.env.QUEUE_ENGINE_URL || 'http://localhost:5000';

router.get('/stream/:providerId', async (req, res) => {

  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  let userId;
  try {
    const decoded = verifyAccessToken(token);
    userId = decoded.sub;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { providerId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendUpdate = async () => {
    try {
      const response = await fetch(
        `${QUEUE_ENGINE_URL}/queue/position/${providerId}/${userId}`
      );
      const data = await response.json();
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      res.write(`data: ${JSON.stringify({ error: true, connected: false })}\n\n`);
    }
  };


  await sendUpdate();

  
  const interval = setInterval(sendUpdate, 5000);

  
  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;