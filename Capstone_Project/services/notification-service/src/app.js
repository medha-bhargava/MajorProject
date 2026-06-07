require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');

function createApp() {
  const app = express();
  app.use(helmet());
  //app.use(cors());
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'UP' }));
  app.get('/notifications', async (_req, res, next) => {
    try { res.json(await db.listNotifications()); } catch (error) { next(error); }
  });
  app.patch('/notifications/:id/read', async (req, res, next) => {
    try {
      const notification = await db.markRead(req.params.id);
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      res.json(notification);
    } catch (error) { next(error); }
  });
  app.use((error, req, res, _next) => {
    res.status(500).json({ timestamp: new Date().toISOString(), status: 500, error: 'Internal Server Error', message: error.message, path: req.path });
  });
  return app;
}

module.exports = { createApp };

