import { trpcLoggedProcedure } from '../../../lib/trpc'
import { zCreateCommentTrpcInput } from './input'
import { TRPCError } from '@trpc/server'
import { ExpectedError } from '../../../lib/error'

export const createCommentTrpcRoute = trpcLoggedProcedure
  .input(zCreateCommentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // 1. Проверка авторизации (как в createIdeaTrpcRoute)
    if (!ctx.me) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Вы не авторизованы',
      })
    }

    // 2. Проверка существования идеи (аналог проверки ника у Idea)
    const ideaExists = await ctx.prisma.idea.findUnique({
      where: { id: input.ideaId },
      select: { 
        id: true, 
        blockedAt: true // Changed from isBlocked to blockedAt
      }
    })
    
    // Then check if blockedAt is not null
    if (ideaExists?.blockedAt) {
      throw new ExpectedError('Нельзя оставлять комментарии в заблокированном обсуждении')
    }

    // 3. Проверка родительского комментария (если указан)
    if (input.parentId) {
      const parentExists = await ctx.prisma.comment.findUnique({
        where: { id: input.parentId },
        select: { id: true, ideaId: true }
      })

      if (!parentExists) {
        throw new ExpectedError('Родительский комментарий не найден')
      }

      if (parentExists.ideaId !== input.ideaId) {
        throw new ExpectedError('Нельзя отвечать на комментарий из другого обсуждения')
      }
    }

    // 4. Создание комментария (аналогично createIdea)
    try {
      await ctx.prisma.comment.create({
        data: {
          content: input.content,
          authorId: ctx.me.id,
          ideaId: input.ideaId,
          parentId: input.parentId || null,
        }
      })

      return true // Точно такой же возврат как в createIdeaTrpcRoute

    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Произошла ошибка при создании комментария',
      })
    }
  })