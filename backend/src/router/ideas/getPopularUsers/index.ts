import { z } from 'zod';
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { TrpcContext } from '../../../lib/trpc';

export const zGetPopularUsersInput = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const getPopularUsersTrpcRoute = trpcLoggedProcedure
  .input(zGetPopularUsersInput)
  .query(async ({ ctx, input }) => {
    const { search, cursor, limit } = input;

    const users = await ctx.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { nick: { contains: search, mode: 'insensitive' as const } },
              { name: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : undefined,
      select: {
        id: true,
        nick: true,
        name: true,
        avatar: true,
        ideas: {
          select: {
            _count: {
              select: { ideasLikes: true },
            },
          },
        },
        _count: {
          select: {
            ideas: true,
          },
        },
        specialist: {
          select: {
            specialty: true,
            isVerified: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1,
    });

    const formatted = users.map((user) => {
      const totalLikes = user.ideas.reduce(
        (sum, idea) => sum + idea._count.ideasLikes,
        0
      );
      const ideasCount = user._count.ideas;

      return {
        id: user.id,
        nick: user.nick,
        name: user.name,
        avatar: user.avatar,
        ideasCount,
        avgLikes: ideasCount > 0 ? Math.round(totalLikes / ideasCount) : 0,
        specialty: user.specialist?.specialty ?? null,
        isVerified: user.specialist?.isVerified ?? false,
      };
    });

    const nextCursor = formatted.length > limit ? formatted[limit].id : null;

    return {
      users: formatted.slice(0, limit),
      nextCursor,
    };
  });
