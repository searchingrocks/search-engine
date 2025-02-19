import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import path from 'path';
import rateLimit from 'express-rate-limit';
// import helmet from 'helmet';
// import morgan from 'morgan';
import mustache from 'mustache';
import fs from 'fs';

import { sessionMiddleware } from './middlewares/session';

import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import documentsRouter from './routes/documents';
import exportsRouter from './routes/exports';
import recordsRouter from './routes/records';
import spatialRouter from './routes/spatial';
import visualizerRouter from './routes/visualizer';

declare module 'express-session' {
  interface SessionData {
    user?: { id: number; username: string; role: string };
  }
}

const indexTemplate = fs.readFileSync(path.join(__dirname, '/templates/home.mustache'), 'utf-8');
const metaPartial = fs.readFileSync(path.join(__dirname, '/templates/meta.mustache'), 'utf-8');

const app = express();
const port = process.env.PORT || 3000;

const hlrToken = process.env.HLR_TOKEN || '';
const hlrSecret = process.env.HLR_SECRET || '';
const basic = crypto.createHash('sha256').update(hlrToken + ':' + hlrSecret).digest('hex');

// Security middleware
// app.use(helmet());

// // Logging middleware
// app.use(morgan('combined'));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session middleware
app.use(...sessionMiddleware);

// Static files middleware
app.use(express.static(path.join(__dirname, '/static')));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Routes
app.use('/', authRouter);
app.use('/admin', adminRouter);
app.use('/documents', documentsRouter);
app.use('/exports', exportsRouter);
app.use('/records', recordsRouter);
app.use('/spatial', spatialRouter);
app.use('/visualize', visualizerRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
  const isLoggedIn = req.session && req.session.user;
  const rendered = mustache.render(indexTemplate, {
    isLoggedIn: isLoggedIn,
  });
  console.log('Is user logged in?', isLoggedIn);
  return res.send(rendered);
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;