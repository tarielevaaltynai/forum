import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { applyTrpcToExpressApp } from './trpc';
import { createAppContext } from './ctx';
import { trpcRouter as appRouter } from '../router'
import { prisma } from './trpc';
import { env } from './env';

describe('tRPC integration', () => {
  let app: express.Express;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        nick: 'test-user',
        email: 'test@example.com',
        password: 'hashed-password', // Подставь хеш пароля, если есть проверка
        name: 'Test',
        surname: 'User',
        gender: 'other',
        birthDate: new Date('2000-01-01'),
      },
    });

    userId = user.id;

    // Генерация JWT токена
    token = jwt.sign({ id: userId }, env.JWT_SECRET);

    // Инициализация express с tRPC
    const ctx = createAppContext();
    app = express();
    await applyTrpcToExpressApp(app, ctx, appRouter);
  });

  afterAll(async () => {
    // Удаляем тестового пользователя
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should respond with expected data from getMe', async () => {
    const res = await request(app)
      .post('/trpc/getMe')
      .send({ input: null })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('result.data.email', 'test@example.com');
  });

  it('should expose /trpc-playground', async () => {
    const res = await request(app).get('/trpc-playground');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
  });
});
