import { trpcLoggedProcedure } from '../../../lib/trpc';
import _ from 'lodash';
import { zGetIdeasTrpcInput } from '../getIdeas/input';

interface InputParams {
  cursor?: number;
  limit: number;
  search?: string;
}

interface RawIdea {
  id: string;
  nick: string;
  name: string;
  description: string;
  createdAt: Date;
  serialNumber: number;
  _count: {
    ideasLikes: number;
  };
  author: {
    nick: string;
    name: string | null;
    avatar: string | null;
  };
}

export const getUserIdeasByNickTrpcRoute = trpcLoggedProcedure
  .input(zGetIdeasTrpcInput)
  .query(async ({ ctx, input }) => {
    if (!ctx.prisma) {
      throw new Error('PrismaClient is not available in context');
    }

    const { cursor, limit, search } = input;
    
    // Используем ник пользователя для поиска идей
    const rawIdeas = await ctx.prisma.idea.findMany({
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
      where: {
        blockedAt: null,
        author: {
          nick: input.search, // Используем переданный ник
        },
      },
      orderBy: [{ createdAt: 'desc' }, { serialNumber: 'desc' }],
      cursor: cursor ? { serialNumber: cursor } : undefined,
      take: limit + 1,
    });

    const nextIdea = rawIdeas.at(limit);
    const nextCursor = nextIdea?.serialNumber;
    const ideasExceptNext = rawIdeas.slice(0, limit).map((idea: RawIdea) => ({
      ..._.omit(idea, ['_count']),
      likesCount: idea._count.ideasLikes,
    }));

    return {
      ideas: ideasExceptNext,
      nextCursor,
    };
  });
