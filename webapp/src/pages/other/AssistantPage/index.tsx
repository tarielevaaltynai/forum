import React, { useState, useEffect, FormEvent } from 'react';
import { trpc } from '../../../lib/trpc';
import { useMe } from '../../../lib/ctx';
import styles from './index.module.scss';
import { Button } from '../../../components/Button';

export const AssistantPage: React.FC = () => {
  const me = useMe(); // информация о текущем пользователе (null, если неавторизован)
  const [query, setQuery] = useState('');
  const [localMessages, setLocalMessages] = useState<{ sender: string; content: string; id: string; timestamp: Date }[]>([]);

  // Получаем историю из базы (для авторизованных)
  const { data: historyData, refetch: refetchHistory } = trpc.getSessionHistory.useQuery(undefined, {
    enabled: !!me, // выполняем запрос только если есть пользователь
  });

  // Мутация для отправки запроса модели
  const askMutation = trpc.askQuestion.useMutation({
    onSuccess: (data) => {
      if (me) {
        // Если авторизован, подгружаем обновлённую историю из БД
        refetchHistory();
      } else {
        // Если неавторизован, сохраняем в локальное состояние
        const userMsg = { sender: 'user', content: query, id: Date.now().toString(), timestamp: new Date() };
        const assistantMsg = { sender: 'assistant', content: data.answer, id: (Date.now()+1).toString(), timestamp: new Date() };
        setLocalMessages(prev => [...prev, userMsg, assistantMsg]);
      }
      setQuery('');
    },
    onError: (err) => {
      // Обработка ошибок (по желанию)
      console.error('Ошибка запроса к модели:', err);
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (me) {
      askMutation.mutate({ query });
    } else {
      // Для неавторизованных: сохраняем вопрос локально и вызываем мутацию
      const userMsg = { sender: 'user', content: query, id: Date.now().toString(), timestamp: new Date() };
      setLocalMessages(prev => [...prev, userMsg]);
      askMutation.mutate({ query });
    }
  };

  // Определяем сообщения для отображения
  const messages = me
    ? (historyData || []).map(m => ({
        sender: m.sender,
        content: m.content,
        id: m.id,
        timestamp: new Date(m.timestamp),
      }))
    : localMessages;

  return (
    <div className={styles.chatContainer}>
      <h1 className={styles.title}>Чат-бот (RAG)</h1>
      <div className={styles.messages}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={msg.sender === 'user' ? styles.messageUser : styles.messageAssistant}
          >
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
        {(askMutation.isLoading) && (
          <div className={styles.messageAssistant}>
            <div className={styles.messageContent}>Пожалуйста, подождите...</div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите ваш вопрос..."
        />
        <Button type="submit" disabled={askMutation.isLoading || !query.trim()}>
          Отправить
        </Button>
      </form>
    </div>
  );
};
