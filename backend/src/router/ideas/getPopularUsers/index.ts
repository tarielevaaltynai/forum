// src/server/trpc/users/popularUsers.ts
import { z } from 'zod';
import { prisma } from '../../../prisma';
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { TrpcContext } from '../../../lib/trpc';

export const zGetPopularUsersInput = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

interface PopularUser {
  id: string;
  nick: string;
  name: string | null;
  avatar: string | null;
  followersCount: number;
  ideasCount: number;
  avgLikes: number;
  specialty?: string | null;
  isVerified?: boolean;
}

export const getPopularUsersTrpcRoute = trpcLoggedProcedure
  .input(zGetPopularUsersInput)
  .query(async ({ ctx, input }: { ctx: TrpcContext; input: { cursor?: string; limit: number; search?: string } }) => {
    if (!ctx.prisma) {
      throw new Error('PrismaClient is not available in context');
    }

    const { search, cursor, limit } = input;
    
    const rawUsers = await ctx.prisma.user.findMany({
      select: {
        id: true,
        nick: true,
        name: true,
        avatar: true,
        _count: {
          select: {
            followers: true,
            ideas: {
              where: { blockedAt: null }
            }
          }
        },
        ideas: {
          select: {
            _count: {
              select: { ideasLikes: true }
            }
          }
        },
        specialist: {
          select: {
            specialty: true,
            isVerified: true
          }
        }
      },
      where: {
        AND: [
          { blockedAt: null },
          search ? {
            OR: [
              { nick: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      orderBy: [
        { followers: { _count: 'desc' } },
        { ideas: { _count: 'desc' } }
      ],
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1,
    });

    const processedUsers = rawUsers.map(user => {
      const totalLikes = user.ideas.reduce((sum, idea) => sum + idea._count.ideasLikes, 0);
      const ideasCount = user._count.ideas;
      
      return {
        id: user.id,
        nick: user.nick,
        name: user.name,
        avatar: user.avatar,
        followersCount: user._count.followers,
        ideasCount,
        avgLikes: ideasCount > 0 ? Math.round(totalLikes / ideasCount) : 0,
        specialty: user.specialist?.specialty,
        isVerified: user.specialist?.isVerified
      };
    });

    const nextUser = processedUsers[limit];
    const nextCursor = nextUser?.id;

    return {
      users: processedUsers.slice(0, limit),
      nextCursor
    };
  });