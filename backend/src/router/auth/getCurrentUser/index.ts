import { trpcLoggedProcedure } from '../../../lib/trpc';

export const getCurrentUserTrpcRoute = trpcLoggedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.prisma || !ctx.me?.id) {
      throw new Error('PrismaClient or user is not available in context');
    }
    
    const userId = ctx.me.id;
    
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        nick: true,
        name: true,
        surname: true, // Добавили фамилию вместо bio
        avatar: true,
        _count: {
          select: {
            ideas: true
          }
        }
      }
    });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Можно также добавить подсчет всех лайков на идеях пользователя
    const totalLikes = await ctx.prisma.ideaLike.count({
      where: {
        idea: {
          authorId: userId
        }
      }
    });
    
    return {
      ...user,
      totalLikes,
      ideasCount: user._count.ideas
    };
  });