import { trpc } from '../../lib/trpc'
import { zSignUpTrpcInput } from './input'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { signJWT } from '../../utils/signJWT'

export const signUpTrpcRoute = trpc.procedure.input(zSignUpTrpcInput).mutation(async ({ ctx, input }) => {
  const exUser = await ctx.prisma.user.findUnique({
    where: {
      nick: input.nick,
      
    },
  })
  if (exUser) {
    throw new Error('Пользователь с таким ником уже существует')
  }
  const user = await ctx.prisma.user.create({
    data: {
      nick: input.nick,
      password: getPasswordHash(input.password),
      name:input.name,
      surname:input.surname,
      birthDate:input.birthDate,
      gender:input.gender


    },
  })
  const token = signJWT(user.id)
  return { token }
})