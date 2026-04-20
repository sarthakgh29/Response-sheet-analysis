import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import sheetsRouter from './routes/sheets.routes.js';
import chatRouter from './routes/chat.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import comparisonsRouter from './routes/comparisons.routes.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.frontendOrigin }));
  app.use(express.json({ limit: '5mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/sheets', sheetsRouter);
  app.use('/api/comparisons', comparisonsRouter);
  app.use('/api/sheets', chatRouter);
  app.use(errorHandler);
  return app;
}
