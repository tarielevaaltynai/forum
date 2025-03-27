
import { trpc } from '../../../lib/trpc'
import _ from 'lodash'
import { zGetIdeasTrpcInput } from './input'
import { PrismaClient } from '@prisma/client';
    // Измените часть с orderBy:

// export const getIdeasTrpcRoute = trpc.procedure.input(zGetIdeasTrpcInput).query(async ({ ctx, input }) => {
//     // const normalizedSearch = input.search ? input.search.trim().replace(/[\s\n\t]/g, '_') : undefined
//     const normalizedSearch = input.search ? input.search.trim().replace(/[\s\n\t]/g, ' & ') : undefined
//   const rawIdeas = await ctx.prisma.idea.findMany({
//     select: {
//       id: true,
//       nick: true,
//       name: true,
//       description: true,
//       createdAt:true,
//       serialNumber: true,
//       _count: {
//         select: {
//           ideasLikes: true,
//         },
//       },
//     },
//     where: {
//       blockedAt: null,
//       ...(!normalizedSearch
//         ? {}
//         : {
//             OR: [
//               {
//                 name: {
//                   search: normalizedSearch,
//                 },
//               },
//               {
//                 description: {
//                   search: normalizedSearch,
//                 },
//               },
//               {
//                 text: {
//                   search: normalizedSearch,
//                 },
//               },
//             ],
//           }),
//     },
//     orderBy: [
//       {
//         createdAt: 'desc',
//       },
//       {
//         serialNumber: 'desc',
//       },
//     ],
//     cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
//     take: input.limit + 1,
//   })
//   const nextIdea = rawIdeas.at(input.limit)
//   const nextCursor = nextIdea?.serialNumber
//   const rawIdeasExceptNext = rawIdeas.slice(0, input.limit)
//   const ideasExceptNext = rawIdeasExceptNext.map((idea) => ({
//     ..._.omit(idea, ['_count']),
//     likesCount: idea._count.ideasLikes,
//   }))
//   return { ideas: ideasExceptNext, nextCursor }
// })

// Встроенный интерфейс вместо импорта
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
}

export const getIdeasTrpcRoute = trpc.procedure
  .input(zGetIdeasTrpcInput)
  .query(async ({ ctx, input }) => {
    const { search: searchQuery, cursor, limit } = input;
    const trimmedSearch = searchQuery?.trim();

    if (!trimmedSearch || trimmedSearch.length < 2) {
      return getDefaultIdeasList(ctx, { cursor, limit });
    }

    try {
      const rawIdeas = await ctx.prisma.$queryRaw<IdeaWithCount[]>`
        SELECT 
          i.id, 
          i.nick, 
          i.name, 
          i.description,
          i."createdAt",
          i."serialNumber",
          COUNT(il.id)::int as "likesCount"
        FROM "Idea" i
        LEFT JOIN "IdeaLike" il ON il."ideaId" = i.id
        WHERE 
          i."blockedAt" IS NULL AND
          (
            i.name % ${trimmedSearch} OR 
            i.description % ${trimmedSearch} OR
            i.text % ${trimmedSearch}
          )
        GROUP BY i.id
        ORDER BY 
          GREATEST(
            similarity(i.name, ${trimmedSearch}),
            similarity(i.description, ${trimmedSearch})
          ) DESC
        LIMIT ${limit + 1}
      `;

      const nextIdea = rawIdeas.at(limit);
      const nextCursor = nextIdea?.serialNumber;
      const ideasExceptNext = rawIdeas.slice(0, limit).map((idea: IdeaWithCount) => ({
        ..._.omit(idea, ['_count']),
        likesCount: idea._count.ideasLikes,
      }));

      return {
        ideas: ideasExceptNext,
        nextCursor
      };
    } catch (error) {
      console.error('Search error:', error);
      return getDefaultIdeasList(ctx, { cursor, limit });
    }
  });

async function getDefaultIdeasList(
  ctx: { prisma: { idea: { findMany: Function } } },
  input: { cursor?: number; limit: number }
) {
  const rawIdeas = await ctx.prisma.idea.findMany({
    select: {
      id: true,
      nick: true,
      name: true,
      description: true,
      createdAt: true,
      serialNumber: true,
      _count: { select: { ideasLikes: true } },
    },
    where: {
      blockedAt: null,
    },
    orderBy: [
      { createdAt: 'desc' },
      { serialNumber: 'desc' }
    ],
    cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
    take: input.limit + 1,
  });

  const nextIdea = rawIdeas.at(input.limit);
  const nextCursor = nextIdea?.serialNumber;
  const ideasExceptNext = rawIdeas.slice(0, input.limit).map((idea: IdeaWithCount) => ({
    ..._.omit(idea, ['_count']),
    likesCount: idea._count.ideasLikes,
  }));

  return {
    ideas: ideasExceptNext,
    nextCursor
  };
}