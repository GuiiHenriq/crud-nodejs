import request from 'supertest';
import { app } from '../../../app'; 
import { prisma } from '../../../shared/lib/prisma';

describe('POST /api/users', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new user and return 201', async () => {
    const userData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);

    const userInDb = await prisma.user.findUnique({ where: { email: userData.email } });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.name).toBe(userData.name);
  });

  it('should return 400 if email is invalid', async () => {
    const userData = {
      name: 'Invalid Email User',
      email: 'invalid-email',
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData);

    expect(response.status).toBe(400);

    const usersInDb = await prisma.user.count();
    expect(usersInDb).toBe(0);
  });
});