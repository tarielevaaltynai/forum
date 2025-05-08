// backend/src/router/assistant/getSessionMessages/index.ts
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const getSessionMessagesTrpcRoute = trpcLoggedProcedure
  .input(z.object({
    sessionId: z.string().uuid(),
  }))
  .query(async ({ ctx, input }) => {
    if (!ctx.me) {
      return [];
    }
    const session = await ctx.prisma.chatSession.findUnique({
      where: { id: input.sessionId },
    });
    if (!session || session.userId !== ctx.me.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Сессия не найдена или доступ запрещён' });
    }
    const messages = await ctx.prisma.chatMessage.findMany({
      where: { sessionId: input.sessionId },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map(m => ({
      id: m.id,
      sender: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.createdAt.toISOString(),
    }));
  });
