import { trpcLoggedProcedure } from '../../../lib/trpc';
import { signUpTrpcRoute } from '../signUp';
import { getPasswordHash } from '../../../utils/getPasswordHash';
import { signJWT } from '../../../utils/signJWT';
import { sendWelcomeEmail } from '../../../lib/emails';



// Мокируем все внешние зависимости
jest.mock('../../../utils/getPasswordHash');
jest.mock('../../../utils/signJWT');
jest.mock('../../../lib/emails');

// Инициализируем tRPC
const t = initTRPC.create();

// Мокируем Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

// Создаем mock контекста
const mockContext = {
  prisma: mockPrisma,
  me: null, // Пользователь не аутентифицирован при регистрации
  stop: jest.fn(), // Мок функции stop
};

// Создаем caller для тестирования процедуры
const createCaller = () => {
  return t.procedure.use(signUpTrpcRoute);
};

// Базовые тестовые данные
const mockInputBase = {
  nick: 'test_user',
  email: 'test@example.com',
  password: 'password123',
  name: 'Test',
  surname: 'User',
  birthDate: '1990-01-01',
  gender: 'MALE' as const,
  role: 'USER' as const,
};

describe('signUpTrpcRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPasswordHash as jest.Mock).mockReturnValue('hashed_password');
    (signJWT as jest.Mock).mockReturnValue('mock_jwt_token');
  });

  it('успешно создает обычного пользователя (USER)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'user_id', ...mockInputBase });

    const caller = createCaller();
    const result = await caller(mockContext, mockInputBase);

    // Проверяем вызовы к БД
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        nick: 'test_user',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test',
        surname: 'User',
        birthDate: '1990-01-01',
        gender: 'MALE',
        role: 'USER',
      },
    });

    // Проверяем побочные эффекты
    expect(sendWelcomeEmail).toHaveBeenCalledTimes(1);
    expect(signJWT).toHaveBeenCalledWith('user_id');
    expect(result).toEqual({ token: 'mock_jwt_token' });
  });

  it('успешно создает эксперта (EXPERT) со специальностью', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'expert_id' });

    const caller = createCaller();
    const result = await caller(mockContext, {
      ...mockInputBase,
      role: 'EXPERT',
      specialty: 'Psychology',
      document: 'doc123',
    });

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        nick: 'test_user',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test',
        surname: 'User',
        birthDate: '1990-01-01',
        gender: 'MALE',
        role: 'EXPERT',
        specialist: {
          create: {
            specialty: 'Psychology',
            document: 'doc123',
          },
        },
      },
    });
    expect(result.token).toBeDefined();
  });

  it('отклоняет регистрацию с занятым никнеймом', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ nick: 'test_user' });

    const caller = createCaller();
    await expect(
      caller(mockContext, mockInputBase)
    ).rejects.toThrow('Пользователь с таким ником уже существует');
  });

  it('отклоняет регистрацию с занятым email', async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(null) // Для nick
      .mockResolvedValueOnce({ email: 'test@example.com' }); // Для email

    const caller = createCaller();
    await expect(
      caller(mockContext, mockInputBase)
    ).rejects.toThrow('User with this email already exists');
  });

  it('требует специальность для эксперта', async () => {
    const caller = createCaller();
    await expect(
      caller(mockContext, {
        ...mockInputBase,
        role: 'EXPERT',
        specialty: undefined,
      })
    ).rejects.toThrow('Не указана специальность');
  });

  it('корректно хеширует пароль', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'user_id' });

    const caller = createCaller();
    await caller(mockContext, mockInputBase);

    expect(getPasswordHash).toHaveBeenCalledWith('password123');
  });

  it('отправляет приветственное письмо', async () => {
    const mockUser = { 
      id: 'user_id', 
      email: 'test@example.com', 
      name: 'Test',
      nick: 'test_user',
      surname: 'User',
      birthDate: new Date('1990-01-01'),
      gender: 'MALE',
      role: 'USER',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      blockedAt: null,
      emailVerified: false,
    };
    
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(mockUser);

    const caller = createCaller();
    await caller(mockContext, mockInputBase);

    expect(sendWelcomeEmail).toHaveBeenCalledWith({ user: mockUser });
  });
});