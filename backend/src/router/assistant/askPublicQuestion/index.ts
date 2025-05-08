// backend/src/router/assistant/askPublicQuestion/index.ts
import { publicProcedure } from '../../../lib/trpc'; // Убедитесь, что путь корректен
import { z } from 'zod';
// Если ваша логика ответа AI вынесена, импортируйте её
// import { getAiResponse } from '../../../services/aiService'; // Пример

export const askPublicQuestionTrpcRoute = publicProcedure
  .input(z.object({
    query: z.string().min(1),
  }))
  .mutation(async ({ input }) => {
    const { query } = input;

    // Здесь происходит обращение к вашей AI-модели
    // Эту логику генерации ответа нужно синхронизировать с askQuestionTrpcRoute
    // или вынести в общий сервис/функцию.
    // Например: const answer = await getAiResponse(query);

    // Пока используем ту же демо-логику для примера:
    let answer = 'Извините, я не могу найти информацию по вашему запросу.';
    if (query.toLowerCase().includes('головн') && query.toLowerCase().includes('бол')) {
      answer = 'Парацетамол — анальгетик, часто используется при головной боли.';
    } else if (query.toLowerCase().includes('погода сегодня')) {
      answer = 'Я не могу предоставить актуальную информацию о погоде, но надеюсь, у вас солнечно!';
    } else {
      answer = `Я виртуальный помощник, вы спросили: «${query}». К сожалению, точный ответ мне неизвестен.`;
    }

    // Важно: Никаких сохранений в базу данных здесь нет.
    // Ни ChatSession, ни ChatMessage не создаются и не обновляются.

    return { answer };
  });