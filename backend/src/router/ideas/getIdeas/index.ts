import { trpcLoggedProcedure } from '../../../lib/trpc';
import _ from 'lodash';
import { zGetIdeasTrpcInput } from './input';
import { TrpcContext } from '../../../lib/trpc';

interface IdeaWithCount {
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
  isLikedByMe?: boolean; // Optional, add if needed
}

interface InputParams {
  cursor?: number;
  limit: number;
  search?: string;
}

export const getIdeasTrpcRoute = trpcLoggedProcedure
  .input(zGetIdeasTrpcInput)
  .query(async ({ ctx, input }: { ctx: TrpcContext; input: InputParams }) => {
    if (!ctx.prisma) {
      throw new Error('PrismaClient is not defined in the context');
    }

    const { search: searchQuery, cursor, limit } = input;
    const trimmedSearch = searchQuery?.trim();

    if (!trimmedSearch || trimmedSearch.length < 2) {
      return getDefaultIdeasList(ctx, { cursor, limit });
    }

    try {
      const rawIdeas = await ctx.prisma.$queryRaw<
        Array<
          IdeaWithCount & {
            likesCount: number;
            relevance: number;
            authorNick: string;
            authorName: string | null;
            authorAvatar: string | null;
          }
        >
      >`
        WITH search_results AS (
          SELECT 
            i.id,
            i.nick,
            i.name,
            i.description,
            i."createdAt",
            i."serialNumber",
            COUNT(il.id)::int as "likesCount",
            GREATEST(
              similarity(i.name, ${trimmedSearch}),
              similarity(i.description, ${trimmedSearch}),
              similarity(i.text, ${trimmedSearch})
            ) as relevance,
            u.nick as "authorNick",
            u.name as "authorName",
            u.avatar as "authorAvatar"
          FROM "Idea" i
          LEFT JOIN "IdeaLike" il ON il."ideaId" = i.id
          LEFT JOIN "User" u ON u.id = i."authorId"
          WHERE 
            i."blockedAt" IS NULL AND
            (
              i.name ILIKE '%' || ${trimmedSearch} || '%' OR
              i.description ILIKE '%' || ${trimmedSearch} || '%' OR
              i.text ILIKE '%' || ${trimmedSearch} || '%'
            )
          GROUP BY i.id, u.nick, u.name, u.avatar
          HAVING GREATEST(
            similarity(i.name, ${trimmedSearch}),
            similarity(i.description, ${trimmedSearch}),
            similarity(i.text, ${trimmedSearch})
          ) > 0.3
        )
        SELECT * FROM search_results
        ORDER BY 
          relevance DESC,
          "likesCount" DESC,
          "createdAt" DESC
        LIMIT ${limit + 1}
      `;

      const nextIdea = rawIdeas.at(limit);
      const nextCursor = nextIdea?.serialNumber;
      const ideasExceptNext = rawIdeas.slice(0, limit).map((idea) => ({
        ..._.omit(idea, ['relevance', '_count']),
        likesCount: idea.likesCount,
        author: {
          nick: idea.authorNick,
          name: idea.authorName,
          avatar: idea.authorAvatar,
        },
      }));

      return {
        ideas: ideasExceptNext,
        nextCursor,
      };
    } catch (error) {
      console.error('Search error:', error);
      return getDefaultIdeasList(ctx, { cursor, limit });
    }
  });

async function getDefaultIdeasList(ctx: TrpcContext, input: InputParams) {
  if (!ctx.prisma) {
    throw new Error('PrismaClient is not available in the context');
  }

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
    },
    orderBy: [{ createdAt: 'desc' }, { serialNumber: 'desc' }],
    cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
    take: input.limit + 1,
  });

  const nextIdea = rawIdeas.at(input.limit);
  const nextCursor = nextIdea?.serialNumber;
  const ideasExceptNext = rawIdeas.slice(0, input.limit).map((idea) => ({
    ..._.omit(idea, ['_count']),
    likesCount: idea._count.ideasLikes,
  }));

  return {
    ideas: ideasExceptNext,
    nextCursor,
  };
}