import { createAppContext } from './ctx'
import { PrismaClient } from '@prisma/client'

// Мокаем createPrismaClient, чтобы не стучаться в настоящую базу
jest.mock('./prisma', () => ({
  createPrismaClient: jest.fn(() => ({
    $disconnect: jest.fn(),
  })),
}))

describe('createAppContext', () => {
  it('should return an object with prisma and stop', async () => {
    const ctx = createAppContext()

    expect(ctx).toHaveProperty('prisma')
    expect(ctx).toHaveProperty('stop')
    expect(typeof ctx.stop).toBe('function')

    // Проверим, что prisma это объект с методом $disconnect
    expect(typeof ctx.prisma.$disconnect).toBe('function')

    // Проверим работу stop
    await ctx.stop()
    expect(ctx.prisma.$disconnect).toHaveBeenCalled()
  })
})
