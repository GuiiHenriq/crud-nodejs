import 'dotenv/config';
import express from 'express';
import { userRoutes } from '@/api/routes/user.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});