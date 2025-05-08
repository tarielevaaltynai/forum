import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trpc } from '../../../lib/trpc';
import { useMe } from '../../../lib/ctx';
import { Segment } from '../../../components/Segment';
import { Button } from '../../../components/Button';
import styles from './index.module.scss';
import { format } from 'date-fns';

export const AssistantPage: React.FC = () => {
  const me = useMe();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  // Перенаправление между маршрутами:
  useEffect(() => {
    if (me) {
      // Если пользователь авторизован, редирект с /assistant на /:nick/assistant
      if (!username || username !== me.nick) {
        navigate(`/${me.nick}/assistant`, { replace: true });
      }
    } else {
      // Если пользователь не авторизован, редирект с /:username/assistant на /assistant
      if (username) {
        navigate('/assistant', { replace: true });
      }
    }
  }, [me, username, navigate]);

  const [query, setQuery] = useState('');
  const [localMessages, setLocalMessages] = useState<
    { sender: string; content: string; id: string; timestamp: Date }[]
  >([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Запрос всех сессий пользователя (только если авторизован)
  const { data: sessions, refetch: refetchSessions } = trpc.getSessions.useQuery(undefined, {
    enabled: !!me,
  });

  // При загрузке сессий выбираем первую сессию
  useEffect(() => {
    if (me && sessions && sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, me, selectedSessionId]);

  // Запрос сообщений выбранной сессии (только если выбрана)
  const { data: messagesData, refetch: refetchMessages } = trpc.getSessionMessages.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId },
  );

  // Мутация отправки вопроса модели (AI)
  const askMutation = trpc.askQuestion.useMutation({
    onSuccess: () => {
      // Обновляем сообщения после получения ответа
      if (me && selectedSessionId) {
        refetchMessages();
      }
    },
  });

  // Создание новой сессии
  const createSessionMutation = trpc.createSession.useMutation({
    onSuccess: (data) => {
      refetchSessions();
      if (data.id) {
        setSelectedSessionId(data.id);
      }
    },
  });

  // Удаление выбранной сессии
  const deleteSessionMutation = trpc.deleteSession.useMutation({
    onSuccess: (_data, variables) => {
      refetchSessions();
      if (selectedSessionId === variables.sessionId) {
        setSelectedSessionId(null);
      }
    },
  });

  // Удаление всех сессий
  const deleteAllMutation = trpc.deleteAllSessions.useMutation({
    onSuccess: () => {
      refetchSessions();
      setSelectedSessionId(null);
    },
  });

  // Обработка отправки формы (вопроса)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (me) {
      // Авторизованный: отправляем через API и обновляем из БД
      askMutation.mutate({ query, sessionId: selectedSessionId! });
    } else {
      // Неавторизованный: добавляем сообщение локально
      const userMsg = {
        sender: 'user',
        content: query,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      setLocalMessages(prev => [...prev, userMsg]);
      // Здесь можно по желанию добавить локальный ответ ассистента (например, заглушку)
      // const assistantMsg = {
      //   sender: 'assistant',
      //   content: 'Ответ от ассистента в локальном режиме недоступен.',
      //   id: Date.now().toString() + '_assistant',
      //   timestamp: new Date(),
      // };
      // setLocalMessages(prev => [...prev, assistantMsg]);

      setQuery('');
    }
  };

  // Формируем итоговый список сообщений (объединяем локальные и серверные, сортируем по дате)
  const messages = [
    ...(messagesData || []).map(m => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      timestamp: new Date(m.timestamp),
    })),
    ...localMessages,
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {username ? `Сессии ${username}` : 'Сессии помощника'}
      </h1>
      {me && (
        <div className={styles.actions}>
          <Button onClick={() => createSessionMutation.mutate()}>Новая сессия</Button>
          <Button onClick={() => deleteAllMutation.mutate()} style={{ marginLeft: '0.5rem' }}>
            Очистить все
          </Button>
        </div>
      )}
      <div className={styles.sessions}>
        {sessions && sessions.map(session => (
          <button
            key={session.id}
            onClick={() => setSelectedSessionId(session.id)}
            className={styles.sessionButton}
            style={{
              fontWeight: selectedSessionId === session.id ? 'bold' : 'normal'
            }}
          >
            {format(new Date(session.createdAt), 'dd.MM.yyyy HH:mm')}
          </button>
        ))}
      </div>
      <div className={styles.messages}>
        {messages.map(msg => (
          <Segment key={msg.id} className={msg.sender === 'assistant' ? styles.assistant : styles.user}>
            <div className={styles.messageHeader}>
              <span className={styles.sender}>
                {msg.sender === 'assistant' ? 'Ассистент' : me && msg.sender === 'user' ? 'Вы' : msg.sender}
              </span>
              <span className={styles.timestamp}>
                {format(msg.timestamp, 'dd.MM.yyyy HH:mm:ss')}
              </span>
            </div>
            <div className={styles.messageContent}>
              {msg.content}
            </div>
          </Segment>
        ))}
      </div>
      <Segment>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите ваш вопрос..."
          />
          <Button type="submit" disabled={askMutation.isLoading || !query.trim()}>
            Отправить
          </Button>
        </form>
      </Segment>
    </div>
  );
};
