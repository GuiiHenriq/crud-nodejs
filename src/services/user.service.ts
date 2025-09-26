import type { User } from '@prisma/client';
import { userRepository } from '@/repositories/user.repository';

export const userService = {
  async create(name: string, email: string): Promise<User> {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use.'); 
    }

    const newUser = await userRepository.create({ name, email });


    return newUser;
  },

  async findAll(): Promise<User[]> {
    return userRepository.findAll();
  },
};