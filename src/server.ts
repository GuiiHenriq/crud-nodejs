import 'dotenv/config';
import { app } from './app';
import { logger } from './shared/lib/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});
