
import { trpc } from '../../../lib/trpc'
import _ from 'lodash'
import { zGetIdeasTrpcInput } from './input'
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



export const getIdeasTrpcRoute = trpc.procedure
  .input(zGetIdeasTrpcInput)
  .query(async ({ ctx, input }) => {
    const searchQuery = input.search?.trim() || ''

    // Если нет поискового запроса - используем обычный запрос
    if (!searchQuery) {
      return getDefaultIdeasList(ctx, input)
    }

    try {
      // Триграммный поиск с учетом релевантности
      const rawIdeas = await ctx.prisma.$queryRaw<
        Array<{
          id: string
          nick: string
          name: string
          description: string
          createdAt: Date
          serialNumber: number
          likesCount: number
          name_sim: number
          desc_sim: number
        }>
      >`
        SELECT 
          i.id, 
          i.nick, 
          i.name, 
          i.description,
          i."createdAt",
          i."serialNumber",
          COUNT(il.id)::int as "likesCount",
          similarity(i.name, ${searchQuery}) AS name_sim,
          similarity(i.description, ${searchQuery}) AS desc_sim
        FROM "Idea" i
        LEFT JOIN "IdeaLike" il ON il."ideaId" = i.id
        WHERE 
          i."blockedAt" IS NULL AND
          (i.name % ${searchQuery} OR 
           i.description % ${searchQuery} OR 
           i.text % ${searchQuery})
        GROUP BY i.id
        ORDER BY GREATEST(name_sim, desc_sim) DESC
        LIMIT ${input.limit + 1}
      `

      const nextIdea = rawIdeas.at(input.limit)
      const nextCursor = nextIdea?.serialNumber
      const ideasExceptNext = rawIdeas.slice(0, input.limit)

      return {
        ideas: ideasExceptNext.map(idea => ({
          id: idea.id,
          nick: idea.nick,
          name: idea.name,
          description: idea.description,
          createdAt: idea.createdAt,
          serialNumber: idea.serialNumber,
          likesCount: idea.likesCount
        })),
        nextCursor
      }
    } catch (error) {
      console.error('Trigram search failed, falling back to default:', error)
      return getDefaultIdeasList(ctx, input)
    }
  })

async function getDefaultIdeasList(ctx: any, input: any) {
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
      { createdAt: 'desc' as const },
      { serialNumber: 'desc' as const }
    ],
    cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
    take: input.limit + 1,
  })

  const nextIdea = rawIdeas.at(input.limit)
  const nextCursor = nextIdea?.serialNumber
  const rawIdeasExceptNext = rawIdeas.slice(0, input.limit)
  // const ideasExceptNext = rawIdeasExceptNext.map((idea) => ({
  //   ..._.omit(idea, ['_count']),
  //   likesCount: idea._count.ideasLikes,
  // }))

  const ideasExceptNext = rawIdeasExceptNext.map((idea: any) => ({
    ..._.omit(idea, ['_count']),
    likesCount: idea._count.ideasLikes,
  }));
  
  
  return { ideas: ideasExceptNext, nextCursor }
}