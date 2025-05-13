
/*import { trpcLoggedProcedure } from '../../../lib/trpc';
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

    // Сохраняем ответ ассистента
    await ctx.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: answer,
      },
    });

    return { answer };
  });
*/
//askQuestion
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getModelAnswer } from '../../../lib/modelClient';

export const askQuestionTrpcRoute = trpcLoggedProcedure
  .input(z.object({ question: z.string().min(1), sessionId: z.string().uuid() }))
  .mutation(async ({ input, ctx }) => {
    const { question, sessionId } = input;
    if (!ctx.me) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const session = await ctx.prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== ctx.me.id) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    await ctx.prisma.chatMessage.create({ data: { sessionId, role: 'user', content: question } });

    let answer: string;
    try {
      answer = await getModelAnswer(question);
    } catch (err: any) {
      console.error('Ошибка при запросе к модели:', err);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Ошибка при обращении к модели' });
    }

    await ctx.prisma.chatMessage.create({ data: { sessionId, role: 'assistant', content: answer } });
    return { answer };
  });

