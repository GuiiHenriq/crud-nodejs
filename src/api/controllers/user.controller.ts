import type { Request, Response } from 'express';
import { userService } from '@/services/user.service';
import { createUserSchema } from '@/api/validators/user.validator';

export const userController = {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email } = createUserSchema.parse(req.body);
      const newUser = await userService.create(name, email);
      return res.status(201).json(newUser);
    } catch (error) {
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