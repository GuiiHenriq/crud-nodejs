import type { Prisma, User } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';

export const userRepository = {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await prisma.user.create({ data });
    return user;
  },

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users;
  },

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  },
};