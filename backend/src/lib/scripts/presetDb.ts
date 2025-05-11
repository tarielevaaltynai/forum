import { env } from '../../lib/env'
import { type AppContext } from '../../lib/ctx'
import { getPasswordHash } from '../../utils/getPasswordHash'

export const presetDb = async (ctx: AppContext) => {
  await ctx.prisma.user.upsert({
    where: {
      nick: 'admin',
    },
    create: {
        nick: 'admin',
        email: 'admin@example.com',
        password: getPasswordHash(env.INITIAL_ADMIN_PASSWORD),
        name: 'Admin', // Укажи подходящее значение
        surname: 'User', // Укажи подходящее значение
        gender: 'other', // Проверь, какие значения допустимы
        birthDate: new Date('2000-01-01'), // Укажи реальную дату или заглушку
        permissions: ['ALL'],
    },
    update: {
      permissions: ['ALL'],
    },
  })
}