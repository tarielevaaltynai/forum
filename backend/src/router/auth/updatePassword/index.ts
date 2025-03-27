import { trpcLoggedProcedure } from '../../../lib/trpc'
import { getPasswordHash } from '../../../utils/getPasswordHash'
import { zUpdatePasswordTrpcInput } from './input'
import { ExpectedError } from '../../../lib/error'

export const updatePasswordTrpcRoute = trpcLoggedProcedure
  .input(zUpdatePasswordTrpcInput)
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new ExpectedError('UNAUTHORIZED')
    }
    if (ctx.me.password !== getPasswordHash(input.oldPassword)) {
      throw new ExpectedError('Wrong old password')
    }
    const updatedMe = await ctx.prisma.user.update({
      where: {
        id: ctx.me.id,
      },
      data: {
        password: getPasswordHash(input.newPassword),
      },
    })
    ctx.me = updatedMe
    return true
  })