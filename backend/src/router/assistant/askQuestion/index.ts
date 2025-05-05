
  import { trpcLoggedProcedure } from '../../../lib/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const askQuestionTrpcRoute = trpcLoggedProcedure
  .input(z.object({
    query: z.string().min(1),
    sessionId: z.string().uuid(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { query, sessionId } = input;
    if (!ctx.me) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Неавторизованный запрос' });
    }
    // Проверяем, что сессия существует и принадлежит пользователю
    const session = await ctx.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== ctx.me.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Сессия не найдена или доступ запрещён' });
    }
    // Сохраняем вопрос пользователя
    await ctx.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: query,
      },
    });

    // Генерация ответа (демо-логика)
    let answer = 'Извините, я не могу найти информацию по вашему запросу.';
    if (query.toLowerCase().includes('головн') && query.toLowerCase().includes('бол')) {
      answer = 'Парацетамол — анальгетик, часто используется при головной боли.';
    } else {
      answer = `Я виртуальный помощник, вы спросили: «${query}». К сожалению, точный ответ мне неизвестен.`;
    }

<<<<<<< HEAD
    // Сохраняем ответ ассистента
    await ctx.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: answer,
      },
    });
=======
    // Сохраняем ответ ассистента, если есть сессия
    if (sessionId) {
      await ctx.prisma.chatMessage.create({
        data: {
          sessionId: sessionId,
          role: 'assistant',
          content: answer,
        },
      });
    }
>>>>>>> 44c9f78 (added assistant page)

    return { answer };
  });
