import { trpcLoggedProcedure } from '../../../lib/trpc';

export const getLikedIdeasTrpcRoute = trpcLoggedProcedure.query(
  async ({ ctx }) => {
    if (!ctx.me) {
      throw new Error('UNAUTHORIZED');
    }

    const likedIdeas = await ctx.prisma.idea.findMany({
      where: {
        ideasLikes: {
          some: {
            userId: ctx.me.id,
          },
        },
        blockedAt: null,
      },
      select: {
        id: true,
        nick: true,
        name: true,
        description: true,
        createdAt: true,
        serialNumber: true,
        _count: { select: { ideasLikes: true } },
        author: {
          select: {
            nick: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return likedIdeas.map((idea) => ({
      ...idea,
      likesCount: idea._count.ideasLikes,
      isLikedByMe: true, // так как это уже понравившиеся
    }));
  }
);
