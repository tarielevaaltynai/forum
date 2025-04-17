import { applyPassportToExpressApp } from './passport';
import { Passport } from 'passport';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { type Express } from 'express';
import { type AppContext } from './ctx';

// Исправленный мок для Passport
jest.mock('passport', () => {
  return {
    // Теперь Passport — это класс (конструктор)
    Passport: jest.fn().mockImplementation(() => ({
      use: jest.fn(),
    })),
  };
});

// Мок для passport-jwt
jest.mock('passport-jwt', () => ({
  Strategy: jest.fn(),
  ExtractJwt: {
    fromAuthHeaderWithScheme: jest.fn().mockReturnValue(() => 'mock-token'),
  },
}));

describe('applyPassportToExpressApp', () => {
  it('should initialize Passport with JWTStrategy', () => {
    const mockExpressApp = { use: jest.fn() } as unknown as Express;
    const mockCtx = {
      prisma: {
        user: {
          findUnique: jest.fn().mockResolvedValue({ id: '123' }),
        },
      },
    } as unknown as AppContext;

    process.env.JWT_SECRET = 'test-secret';

    applyPassportToExpressApp(mockExpressApp, mockCtx);

    // Проверяем, что Passport был вызван как конструктор
    expect(Passport).toHaveBeenCalledTimes(1);

    // Проверяем, что JWTStrategy была инициализирована с правильными параметрами
    expect(JWTStrategy).toHaveBeenCalledWith(
      {
        secretOrKey: 'test-secret',
        jwtFromRequest: expect.any(Function), // `ExtractJwt.fromAuthHeaderWithScheme` возвращает функцию
      },
      expect.any(Function), // Колбэк для проверки пользователя
    );
  });
});