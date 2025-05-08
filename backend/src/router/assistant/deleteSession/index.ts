// backend/src/router/assistant/deleteSession/index.ts
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const deleteSessionTrpcRoute = trpcLoggedProcedure
  .input(z.object({
    sessionId: z.string().uuid(),
  }))
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Неавторизованный запрос' });
    }
    const session = await ctx.prisma.chatSession.findUnique({
      where: { id: input.sessionId },
    });
    if (!session || session.userId !== ctx.me.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Сессия не найдена или доступ запрещён' });
    }
    await ctx.prisma.chatMessage.deleteMany({
      where: { sessionId: input.sessionId },
    });
    await ctx.prisma.chatSession.delete({
      where: { id: input.sessionId },
    });
    return { success: true };
  });
