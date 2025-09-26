import type { Request, Response } from 'express';
import { userService } from '../../services/user.service';
import { createUserSchema } from '../validators/user.validator';
import { logger } from '../../shared/lib/logger';

export const userController = {
  async create(req: Request, res: Response): Promise<Response> {
    const log = logger.child({ context: 'userController.create' });

    try {
      const { name, email } = createUserSchema.parse(req.body);

      log.info(`Attempting to create user with email: ${email}`);

      const newUser = await userService.create(name, email);

      log.info(`User created successfully with id: ${newUser.id}`);

      return res.status(201).json(newUser);
    } catch (error) {
      log.error({ error }, 'Failed to create user.');

      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const users = await userService.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};