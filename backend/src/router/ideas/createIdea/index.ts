import { trpc } from '../../../lib/trpc'
import { zCreateIdeaTrpcInput } from './input'
import { TRPCError } from '@trpc/server'

export const createIdeaTrpcRoute = trpc.procedure.input(zCreateIdeaTrpcInput).mutation(async ({ input, ctx }) => {
  if (!ctx.me) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Вы не авторизованы',
    })
  }

  const exIdea = await ctx.prisma.idea.findUnique({
    where: {
      nick: input.nick,
    },
  })

  if (exIdea) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Обсуждение с этим ником уже существует.',
    })
  }

  try {
    await ctx.prisma.idea.create({
      data: { ...input, authorId: ctx.me.id },
    })
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Произошла ошибка при создании обсуждения.',
    })
  }

  return true
})
