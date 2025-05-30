// import { trpcLoggedProcedure } from '../../../lib/trpc'
// import { getPasswordHash } from '../../../utils/getPasswordHash'
// import { zSignInTrpcInput } from './input'
// import { signJWT } from '../../../utils/signJWT'
// import { ExpectedError } from '../../../lib/error'

// export const signInTrpcRoute = trpcLoggedProcedure.input(zSignInTrpcInput).mutation(async ({ ctx, input }) => {
//   const user = await ctx.prisma.user.findFirst({
//     where: {
//       nick: input.nick,
//       password: getPasswordHash(input.password),
//     },
//   })
//   if (!user) {
//     throw new ExpectedError('Неверный пароль или ник')
//   }
//   const token = signJWT(user.id)
//   return { token }
// })

// backend/src/router/auth/signIn/index.ts
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { getPasswordHash } from "../../../utils/getPasswordHash";
import { zSignInTrpcInput } from "./input";
import { signJWT } from "../../../utils/signJWT";
import { ExpectedError } from "../../../lib/error";

export const signInTrpcRoute = trpcLoggedProcedure
  .input(zSignInTrpcInput)
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        nick: input.nick,
        password: getPasswordHash(input.password),
      },
    });

    if (!user) {
      throw new ExpectedError("Неверный пароль или ник");
    }

    const token = signJWT(user.id);
    return { token };
  });
