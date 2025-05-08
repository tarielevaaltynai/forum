// backend/src/router/assistant/deleteAllSessions/index.ts
import { trpcLoggedProcedure } from '../../../lib/trpc';

export const deleteAllSessionsTrpcRoute = trpcLoggedProcedure
  .mutation(async ({ ctx }) => {
    if (!ctx.me) {
      return { success: false };
    }
    const sessions = await ctx.prisma.chatSession.findMany({
      where: { userId: ctx.me.id },
      select: { id: true },
    });
    const sessionIds = sessions.map(s => s.id);
    if (sessionIds.length > 0) {
      await ctx.prisma.chatMessage.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });
      await ctx.prisma.chatSession.deleteMany({
        where: { userId: ctx.me.id },
      });
    }
    return { success: true };
  });
