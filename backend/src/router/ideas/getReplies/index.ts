import { trpcLoggedProcedure } from '../../../lib/trpc'
import {z} from 'zod'
//import { zGetRepliesTrpcInput } from './input'

export const zGetRepliesTrpcInput = z.object({
  parentId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().uuid().optional()
})
export const getRepliesTrpcRoute = trpcLoggedProcedure
  .input(zGetRepliesTrpcInput)
  .query(async ({ ctx, input }) => {
    // 1. Получаем ответы
    const replies = await ctx.prisma.comment.findMany({
      where: {
        parentId: input.parentId,
        isBlocked: false
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        isEdited: true,
        author: {
          select: {
            id: true,
            nick: true,
            avatar: true
          }
        },
        _count: {
          select: {
            replies: true // Количество вложенных ответов
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Сортировка от старых к новым
      },
      take: input.limit + 1, // Для пагинации
      cursor: input.cursor ? { id: input.cursor } : undefined
    })

    // 2. Пагинация
    const nextReply = replies.at(input.limit)
    const nextCursor = nextReply?.id
    const repliesList = replies.slice(0, input.limit)

    // 3. Формируем ответ
    return {
      replies: repliesList.map(reply => ({
        ...reply,
        repliesCount: reply._count.replies
      })),
      nextCursor
    }
  })