// __tests__/passport.unit.test.ts
import { applyPassportToExpressApp } from '../lib/passport'
import { AppContext } from '../lib/ctx'
import express from 'express'
import { Strategy as JWTStrategy } from 'passport-jwt'
import passport from 'passport'
import jwt from 'jsonwebtoken'

jest.mock('passport', () => {
  const original = jest.requireActual('passport')
  return {
    ...original,
    authenticate: jest.fn(() => (req: any, res: any, next: any) => next()),
    use: jest.fn(),
  }
})

describe('applyPassportToExpressApp (unit)', () => {
  const fakeUser = { id: 'user-id', email: 'test@example.com' }

  const mockCtx: AppContext = {
    prisma: {
      user: {
        findUnique: jest.fn().mockResolvedValue(fakeUser),
      },
    },
  } as unknown as AppContext

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret'
  })

  it('should call passport.use and add middleware', () => {
    const app = express()
    const useSpy = jest.spyOn(passport, 'use')
    applyPassportToExpressApp(app, mockCtx)

    expect(useSpy).toHaveBeenCalledWith(expect.any(JWTStrategy))
  })

  it('should call ctx.prisma.user.findUnique inside JWT strategy', async () => {
    // имитируем вызов verify-функции JWT стратегии вручную
    const verify = (passport.use as jest.Mock).mock.calls[0][0]._verify

    const done = jest.fn()
    await verify('user-id', done)

    expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    })

    expect(done).toHaveBeenCalledWith(null, fakeUser)
  })

  it('should call done(null, false) if user not found', async () => {
    const verify = (passport.use as jest.Mock).mock.calls[0][0]._verify
    const done = jest.fn()

    // эмулируем ситуацию, когда пользователь не найден
    mockCtx.prisma.user.findUnique = jest.fn().mockResolvedValue(null)

    await verify('unknown-id', done)

    expect(done).toHaveBeenCalledWith(null, false)
  })

  it('should call done(error, false) on exception', async () => {
    const verify = (passport.use as jest.Mock).mock.calls[0][0]._verify
    const done = jest.fn()
    const testError = new Error('DB failure')

    mockCtx.prisma.user.findUnique = jest.fn().mockRejectedValue(testError)

    await verify('bad-id', done)

    expect(done).toHaveBeenCalledWith(testError, false)
  })
})
