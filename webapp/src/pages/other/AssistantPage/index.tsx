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
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Перенаправление по роутам
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

  // Скрытие сайдбара на мобильных устройствах по умолчанию
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    // Установка начального состояния
    handleResize();

    // Добавление обработчика изменения размера окна
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { sessionId: selectedSessionId },
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
        // На мобильных скрываем сайдбар после создания сессии
        if (window.innerWidth <= 768) {
          setSidebarVisible(false);
        }
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
      if (selectedSessionId) {
        askMutation.mutate({ question: query, sessionId: selectedSessionId });
        setQuery('');
      } else if (sessions && sessions.length === 0) {
        // Если нет сессий, создаем новую и затем отправляем сообщение
        createSessionMutation.mutate();
        // После создания сессии мы не можем сразу отправить сообщение,
        // так как нам нужно дождаться завершения мутации и получения ID сессии
      } else {
        console.warn("Нет выбранной сессии, невозможно задать вопрос.");
      }
    } else {
      // Неавторизованный: добавляем сообщение локально
      const userMsg = {
        sender: 'user',
        content: query,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      
      const assistantMsg = {
        sender: 'assistant',
        content: 'Для полноценного использования ассистента, пожалуйста, войдите в систему.',
        id: Date.now().toString() + '_assistant',
        timestamp: new Date(Date.now() + 1000), // Добавляем 1 секунду, чтобы сообщение появилось после
      };
      
      setLocalMessages(prev => [...prev, userMsg, assistantMsg]);
      setQuery('');
    }
  };

  // Формируем итоговый список сообщений
  const messages = [
    ...(messagesData || []).map(m => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      timestamp: new Date(m.timestamp),
    })),
    ...localMessages,
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Авто-скролл вниз при новых сообщениях
  useEffect(() => {
    const messagesContainer = document.querySelector(`.${styles.messages}`);
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // На мобильных скрываем сайдбар после выбора сессии
    if (window.innerWidth <= 768) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          className={styles.toggleSidebar} 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className={styles.title}>
          {username ? `Ассистент: ${username}` : 'Ассистент'}
        </h1>
        {/* Можно добавить дополнительные элементы в хедер */}
      </header>

      <aside className={`${styles.sidebar} ${sidebarVisible ? styles.visible : ''}`}>
        {me && (
          <div className={styles.actions}>
            <Button onClick={() => createSessionMutation.mutate()}>Новая сессия</Button>
            {sessions && sessions.length > 0 && (
              <Button 
                onClick={() => {
                  if (selectedSessionId) {
                    deleteSessionMutation.mutate({ sessionId: selectedSessionId });
                  } else if (sessions.length > 0) {
                    deleteAllMutation.mutate();
                  }
                }}
              >
                {selectedSessionId ? 'Удалить сессию' : 'Очистить все'}
              </Button>
            )}
          </div>
        )}
        <div className={styles.sessions}>
          {sessions && sessions.length > 0 ? (
            sessions.map(session => (
              <button
                key={session.id}
                onClick={() => handleSessionSelect(session.id)}
                className={`${styles.sessionButton} ${selectedSessionId === session.id ? styles.active : ''}`}
              >
                {format(new Date(session.createdAt), 'dd.MM.yyyy HH:mm')}
              </button>
            ))
          ) : me ? (
            <div className={styles.emptyState}>
              <div className={styles.icon}>💬</div>
              <h3>Нет активных сессий</h3>
              <p>Создайте новую сессию, чтобы начать общение с ассистентом</p>
            </div>
          ) : null}
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.messages}>
          {messages.length > 0 ? (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`${styles.message} ${msg.sender === 'assistant' ? styles.assistant : styles.user}`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.sender}>
                    {msg.sender === 'assistant' ? 'Ассистент' : me && msg.sender === 'user' ? 'Вы' : msg.sender}
                  </span>
                  <span className={styles.timestamp}>
                    {format(msg.timestamp, 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
                <div className={styles.messageContent}>
                  {msg.content}
                </div>
              </div>
            ))
          ) : selectedSessionId || !me ? (
            <div className={styles.emptyState}>
              <div className={styles.icon}>🤖</div>
              <h3>Нет сообщений</h3>
              <p>Задайте вопрос, чтобы начать общение с ассистентом</p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.icon}>👋</div>
              <h3>Выберите или создайте сессию</h3>
              <p>Создайте новую сессию в боковом меню, чтобы начать общение</p>
            </div>
          )}
        </div>
      </main>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Введите ваш вопрос..."
          disabled={askMutation.isLoading || (me && !selectedSessionId && (!sessions || sessions.length === 0))}
        />
        <Button 
          type="submit" 
          disabled={askMutation.isLoading || !query.trim() || (me && !selectedSessionId && (!sessions || sessions.length === 0))}
        >
          Отправить
        </Button>
      </form>
    </div>
  );
};