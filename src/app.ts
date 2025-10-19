import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { userRoutes } from './api/routes/user.routes';
import { logger } from './shared/lib/logger';

const app = express();

app.use(helmet());

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.use('/api', userRoutes);

app.use(
  (error: Error, request: Request, response: Response, _next: NextFunction) => {
    logger.error({ error }, 'Unhandled error occurred!');

    return response.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  },
);

export { app };
