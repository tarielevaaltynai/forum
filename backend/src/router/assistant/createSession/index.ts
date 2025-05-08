// backend/src/router/assistant/createSession/index.ts
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { TRPCError } from '@trpc/server';

export const createSessionTrpcRoute = trpcLoggedProcedure
  .mutation(async ({ ctx }) => {
    if (!ctx.me) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Неавторизованный запрос' });
    }
    const session = await ctx.prisma.chatSession.create({
      data: { user: { connect: { id: ctx.me.id } } },
    });
    return {
      id: session.id,
      createdAt: session.createdAt.toISOString(),
    };
  });
