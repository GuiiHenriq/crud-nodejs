import express, { NextFunction, Request, Response } from 'express';
import { userRoutes } from './api/routes/user.routes';
import { logger } from './shared/lib/logger';

const app = express();

app.use(express.json());
app.use('/api', userRoutes);

app.use(
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    logger.error(error, 'Unhandled error occurred!');

    return response.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  },
);

export { app };
