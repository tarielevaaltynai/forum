// backend/src/router/assistant/getSessions/index.ts
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { TRPCError } from '@trpc/server';

export const getSessionsTrpcRoute = trpcLoggedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.me) {
      // Если неавторизован, возвращаем пустой список
      return [];
    }
    // Получаем все сессии пользователя, сортируя по дате создания (newest first)
    const sessions = await ctx.prisma.chatSession.findMany({
      where: { userId: ctx.me.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    });
    return sessions.map(s => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
    }));
  });
