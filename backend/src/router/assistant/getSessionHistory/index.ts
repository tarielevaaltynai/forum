import { trpcLoggedProcedure } from '../../../lib/trpc';
import { TRPCError } from '@trpc/server';

export const getSessionHistoryTrpcRoute = trpcLoggedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.me) {
      // Если пользователь не авторизован, возвращаем пустой массив
      return [];
    }
    // Находим единственную сессию пользователя
    const session = await ctx.prisma.chatSession.findFirst({
      where: { userId: ctx.me.id }
    });
    if (!session) {
      return [];
    }
    // Получаем сообщения в этой сессии в хронологическом порядке
    const messages = await ctx.prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
    });
    // Преобразуем результат: вернем массив объектов { id, role, content, createdAt }
    return messages.map(m => ({
      id: m.id,
      sender: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.createdAt,
    }));
  });
