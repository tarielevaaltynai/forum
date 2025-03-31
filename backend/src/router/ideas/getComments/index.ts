import { trpcLoggedProcedure } from '../../../lib/trpc'
import { zGetCommentsTrpcInput } from './input'


export const getCommentsTrpcRoute = trpcLoggedProcedure
  .input(zGetCommentsTrpcInput)
  .query(async ({ ctx, input }) => {
    // 1. Получаем корневые комментарии (parentId: null)
    const rootComments = await ctx.prisma.comment.findMany({
      where: {
        ideaId: input.ideaId,
        parentId: null,
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
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Сортировка от новых к старым
      },
      take: input.limit + 1, // +1 для определения nextCursor
      cursor: input.cursor ? { id: input.cursor } : undefined
    })

    // 2. Пагинация
    const nextComment = rootComments.at(input.limit)
    const nextCursor = nextComment?.id
    const comments = rootComments.slice(0, input.limit)

    // 3. Формируем ответ
    return {
      comments: comments.map(comment => ({
        ...comment,
        repliesCount: comment._count.replies
      })),
      nextCursor
    }
  })