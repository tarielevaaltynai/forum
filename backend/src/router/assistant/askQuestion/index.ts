import { trpcLoggedProcedure } from '../../../lib/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const askQuestionTrpcRoute = trpcLoggedProcedure
  .input(z.object({ query: z.string().min(1) }))
  .mutation(async ({ input, ctx }) => {
    const { query } = input;
    // Получаем или создаем сессию для пользователя (если авторизован)
    let sessionId: string | undefined = undefined;
    if (ctx.me) {
      let session = await ctx.prisma.chatSession.findFirst({
        where: { userId: ctx.me.id }
      });
      if (!session) {
        session = await ctx.prisma.chatSession.create({
          data: { user: { connect: { id: ctx.me.id } } },
        });
      }
      sessionId = session.id;
      // Сохраняем вопрос пользователя
      await ctx.prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'user',
          content: query,
        },
      });
    }

    // TODO: здесь следует реализовать логику RAG (BM25 + Pinecone + вызов LLM)
    // Для демонстрации вернем простой ответ.
    // Например, если в запросе есть слова «головн» и «бол», даем примерный ответ:
    let answer = 'Извините, я не могу найти информацию по вашему запросу.';
    if (query.toLowerCase().includes("головн") && query.toLowerCase().includes("бол")) {
      answer = 'Парацетамол — анальгетик, часто используется при головной боли.';
    } else {
      answer = `Я виртуальный помощник, вы спросили: «${query}». К сожалению, точный ответ мне неизвестен.`;
    }

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

    return { answer };
  });
