// backend/src/router/users/blockUser/index.ts
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { zBlockUserInput } from './input';
import { ExpectedError } from '../../../lib/error';

export const blockUserTrpcRoute = trpcLoggedProcedure
  .input(zBlockUserInput)
  .mutation(async ({ ctx, input }) => {
    // Явная проверка на авторизацию
    if (!ctx.me || !ctx.me.id || !ctx.me.permissions) {
      throw new ExpectedError('Требуется авторизация');
    }

    // Проверка прав администратора
    const hasPermission = ctx.me.permissions.some(
      permission => permission === 'ALL' || permission === 'BLOCK_IDEAS'
    );

    if (!hasPermission) {
      throw new ExpectedError('Недостаточно прав для блокировки');
    }

    // Защита от самоблокировки
    if (input.userId === ctx.me.id) {
      throw new ExpectedError('Нельзя заблокировать себя');
    }

    // Проверка существования пользователя
    const userExists = await ctx.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true }
    });

    if (!userExists) {
      throw new ExpectedError('Пользователь не найден');
    }

    // Обновление статуса
    await ctx.prisma.user.update({
      where: { id: input.userId },
      data: { 
        blocked: input.blocked,
        blockedAt: input.blocked ? new Date() : null
      },
    });

    return { success: true };
  });