import { z } from 'zod';
import { trpcLoggedProcedure } from '../../../lib/trpc';

export const getUserProfileByNickTrpcRoute = trpcLoggedProcedure
  .input(z.object({ nick: z.string() }))
  .query(async ({ ctx, input }) => {
    if (!ctx.prisma) {
      throw new Error('PrismaClient is not available in context');
    }

    // Ищем пользователя по нику
    const user = await ctx.prisma.user.findUnique({
      where: { nick: input.nick },
      select: {
        nick: true,
        name: true,
        avatar: true,
        createdAt: true,
        surname: true,
        gender: true,
        birthDate: true,
        _count: { select: { ideas: true } },
        specialist: {
          select: {
            specialty: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      nick: user.nick,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      surname: user.surname,
      gender: user.gender,
      birthDate: user.birthDate,
      ideasCount: user._count.ideas,
      specialty: user.specialist?.isVerified ? user.specialist.specialty : null,
    };
  });