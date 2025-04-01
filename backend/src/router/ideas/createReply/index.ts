import { trpcLoggedProcedure } from '../../../lib/trpc';
import { TRPCError } from '@trpc/server';
import { ExpectedError } from '../../../lib/error';
import { z } from 'zod';

export const zCreateReplyTrpcInput = z.object({
  ideaId: z.string().nonempty(),
  content: z.string().min(1).max(2000),
  parentId: z.string().nonempty(),
});

export const createReplyTrpcRoute = trpcLoggedProcedure
  .input(zCreateReplyTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Вы не авторизованы',
      });
    }

    // Проверка существования идеи
    const idea = await ctx.prisma.idea.findUnique({
      where: { id: input.ideaId },
      select: { id: true, blockedAt: true }
    });

    if (!idea) {
      throw new ExpectedError('Обсуждение не найдено');
    }

    if (idea.blockedAt) {
      throw new ExpectedError('Нельзя оставлять комментарии в заблокированном обсуждении');
    }

    // Проверка родительского комментария
    const parentComment = await ctx.prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { 
        id: true, 
        ideaId: true,
        isBlocked: true
      }
    });

    if (!parentComment) {
      throw new ExpectedError('Родительский комментарий не найден');
    }

    if (parentComment.ideaId !== input.ideaId) {
      throw new ExpectedError('Нельзя отвечать на комментарий из другого обсуждения');
    }

    if (parentComment.isBlocked) {
      throw new ExpectedError('Нельзя отвечать на заблокированный комментарий');
    }

    try {
      const reply = await ctx.prisma.comment.create({
        data: {
          content: input.content,
          authorId: ctx.me.id,
          ideaId: input.ideaId,
          parentId: input.parentId,
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
          }
        }
      });

      return { reply };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Произошла ошибка при создании ответа',
      });
    }
  });