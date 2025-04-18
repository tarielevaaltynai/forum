import { z } from 'zod';
import { trpcLoggedProcedure } from '../../../lib/trpc';

export const getUserProfileTrpcRoute = trpcLoggedProcedure
.query(async ({ ctx }) => {
  if (!ctx.prisma || !ctx.me?.id) {
    throw new Error('PrismaClient or user is not available in context');
  }

  // Используем ID из контекста авторизации
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.me.id },
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