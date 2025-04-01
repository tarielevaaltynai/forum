import { trpcLoggedProcedure } from '../../../lib/trpc'
import { ExpectedError } from '../../../lib/error'
import { zSignUpTrpcInput } from './input'
import { getPasswordHash } from '../../../utils/getPasswordHash'
import { signJWT } from '../../../utils/signJWT'
import { sendWelcomeEmail } from '../../../lib/emails'
export const signUpTrpcRoute = trpcLoggedProcedure.input(zSignUpTrpcInput).mutation(async ({ ctx, input }) => {
  console.log("Полученные данные:", input)
  const exUserWithNick = await ctx.prisma.user.findUnique({
    where: {
      nick: input.nick,

      
    },
  })
  if (exUserWithNick) {
    throw new ExpectedError('Пользователь с таким ником уже существует')
  }
  const exUserWithEmail = await ctx.prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })
  if (exUserWithEmail) {
    throw new ExpectedError('User with this email already exists')
  }
  const user = await ctx.prisma.user.create({
    data: {
      nick: input.nick,
      email:input.email,
      password: getPasswordHash(input.password),
      name:input.name,
      surname:input.surname,
      birthDate:input.birthDate,
      gender:input.gender


    },
  })
  void sendWelcomeEmail({ user })
  const token = signJWT(user.id)
  return { token }
})

