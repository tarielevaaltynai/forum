// backend/src/lib/modelClient.ts
export interface ModelResponse {
  answer: string;
}

/**
 * Отправляет вопрос на Python-сервис модели и возвращает ответ.
 * @param question Текст вопроса
 */
export async function getModelAnswer(question: string): Promise<string> {
  const modelUrl = process.env.MODEL_API_URL;
  if (!modelUrl) {
    throw new Error('MODEL_API_URL не задан');
  }

  const res = await fetch(`${modelUrl}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error(`Ошибка модели: ${res.status}`);
  }

  const data = (await res.json()) as unknown;
  if (
    typeof data === 'object' &&
    data !== null &&
    'answer' in data &&
    typeof (data as any).answer === 'string'
  ) {
    return (data as any).answer;
  } else {
    throw new Error('Некорректная структура ответа от модели');
  }
}

