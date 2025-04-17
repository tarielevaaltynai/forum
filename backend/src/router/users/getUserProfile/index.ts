// backend/src/router/users/getUserProfile/index.ts
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { zGetUserProfileInput } from './input';
import { ExpectedError } from '../../../lib/error';

export const getUserProfileTrpcRoute = trpcLoggedProcedure
  .input(zGetUserProfileInput)
  .query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        nick: true,
        name: true,
        surname: true,
        avatar: true,
        gender: true,
        birthDate: true,
        createdAt: true,
        // Учитываем, что эти поля нужно добавить в схему Prisma
        blocked: true,
        blockedAt: true,
        _count: {
          select: {
            ideas: true,
            comments: true,
            ideasLikes: true,
          },
        },
      },
    });

    if (!user) {
      throw new ExpectedError('Пользователь не найден');
    }

    return { user };
  });