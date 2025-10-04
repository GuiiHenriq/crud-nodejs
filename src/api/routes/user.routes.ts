import { Router } from 'express';
import { userController } from '@/api/controllers/user.controller';

const userRoutes = Router();

userRoutes.post('/users', userController.create);
userRoutes.get('/users', userController.findAll);

export { userRoutes };
