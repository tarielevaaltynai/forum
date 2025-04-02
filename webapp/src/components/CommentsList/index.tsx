import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import css from './index.module.scss';

type CommentType = {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  repliesCount: number;
  author: {
    id: string;
    nick: string;
    avatar?: string;
  };
  _count?: {  // Добавьте это поле
    replies: number;
  };
};
export function CommentList({ comments, ideaId }: { comments?: CommentType[]; ideaId: string }) {
  console.debug('[CommentList] Rendering with:', { 
    commentsCount: comments?.length || 0, 
    ideaId 
  });

  if (!comments || comments.length === 0) {
    return <p>Комментариев пока нет.</p>;
  }

  return (
    <div className={css.commentList}>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} ideaId={ideaId} />
      ))}
    </div>
  );
}

export function CommentItem({ comment, ideaId }: { comment: CommentType; ideaId: string }) {
  console.debug('[CommentItem] Rendering comment:', { 
    id: comment.id, 
    repliesCount: comment.repliesCount 
  });

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const utils = trpc.useContext();
  
  const { 
    data: replies, 
    isLoading: isLoadingReplies,
    isFetching: isFetchingReplies,
    refetch: refetchReplies
  } = trpc.getReplies.useQuery(
    { parentId: comment.id },
    { 
      enabled: false, // Будем запускать вручную
      onSuccess: (data) => {
        console.debug('[getReplies] Success:', { 
          parentId: comment.id, 
          repliesCount: data.length 
        });
      },
      onError: (error) => {
        console.error('[getReplies] Error:', error);
        setError('Ошибка загрузки ответов');
      },
      staleTime: 60 * 1000 // 1 минута
    }
  );

  const createReply = trpc.createReply.useMutation({
    onSuccess: () => {
      console.debug('[createReply] Success');
      utils.getComments.invalidate({ ideaId });
      refetchReplies(); // Перезагружаем ответы
      setShowReplyForm(false);
      setError(null);
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('[createReply] Error:', error);
      setError(error.message || 'Ошибка при создании ответа');
      setIsProcessing(false);
    }
  });

  const handleToggleReplies = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isProcessing) {
      console.debug('[handleToggleReplies] Already processing, skipping');
      return;
    }

    try {
      setIsProcessing(true);
      const newState = !showReplies;
      console.debug('[handleToggleReplies] Toggling:', { 
        current: showReplies, 
        new: newState 
      });

      if (newState && comment.repliesCount > 0) {
        console.debug('[handleToggleReplies] Fetching replies...');
        await refetchReplies();
      }

      setShowReplies(newState);
    } catch (err) {
      console.error('[handleToggleReplies] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, content: string) => {
    e.preventDefault();
    console.debug('[handleReplySubmit] Submitting:', { content });

    if (!content.trim()) {
      setError('Введите текст ответа');
      return;
    }

    try {
      setIsProcessing(true);
      await createReply.mutateAsync({ 
        ideaId,
        parentId: comment.id,
        content
      });
    } catch (err) {
      console.error('[handleReplySubmit] Error:', err);
    }
  };

  return (
    <div className={css.comment}>
      <div className={css.commentContent}>
        {comment.author.avatar && (
          <img src={comment.author.avatar} alt={comment.author.nick} className={css.avatar} />
        )}
        <div className={css.commentBody}>
          <div className={css.commentHeader}>
            <span className={css.authorName}>{comment.author.nick}</span>
            <span className={css.commentDate}>
              {new Date(comment.createdAt).toLocaleString()}
              {comment.isEdited && ' (изменено)'}
            </span>
          </div>
          <p className={css.commentText}>{comment.content}</p>
          
          <div className={css.commentActions}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowReplyForm(!showReplyForm);
              }}
              className={css.replyButton}
              disabled={isProcessing}
            >
              Ответить
            </button>
            
            {comment.repliesCount > 0 && (
              <button 
                onClick={handleToggleReplies}
                className={css.toggleRepliesBtn}
                disabled={isProcessing || isFetchingReplies}
              >
                {isFetchingReplies ? 'Загрузка...' : 
     
            showReplies ? 'Скрыть ответы' : `Ответы (${comment.repliesCount})`}
              </button>
            )}
          </div>
          
          {showReplyForm && (
            <div className={css.replyContainer}>
              {error && <div className={css.error}>{error}</div>}
              <ReplyForm 
                onSubmit={handleReplySubmit} 
                onCancel={() => {
                  console.debug('[ReplyForm] Cancelled');
                  setShowReplyForm(false);
                  setError(null);
                }}
                isLoading={isProcessing}
              />
            </div>
          )}
        </div>
      </div>
      
      {showReplies && (
  <div className={css.replies}>
    {isFetchingReplies ? (
      <p>Загрузка ответов...</p>
    ) : replies?.replies?.length ? (
      <CommentList 
        comments={replies.replies} 
        ideaId={ideaId} 
      />
    ) : (
      <p>Нет ответов</p>
    )}
  </div>
)}
    </div>
  );
}

function ReplyForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (e: React.FormEvent, content: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.debug('[ReplyForm] Submitting:', { contentLength: content.length });
    onSubmit(e, content);
  };

  return (
    <form onSubmit={handleSubmit} className={css.replyForm}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ваш ответ..."
        rows={2}
        required
        disabled={isLoading}
      />
      <div className={css.replyFormButtons}>
        <button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? 'Отправка...' : 'Отправить'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className={css.cancelButton}
          disabled={isLoading}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

export function CreateCommentForm({ ideaId }: { ideaId: string }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();
  
  const createComment = trpc.createComment.useMutation({
    onSuccess: () => {
      console.debug('[createComment] Success');
      setContent('');
      setError(null);
      utils.getComments.invalidate({ ideaId });
    },
    onError: (error) => {
      console.error('[createComment] Error:', error);
      setError(error.message || 'Ошибка при создании комментария');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.debug('[CreateCommentForm] Submitting:', { contentLength: content.length });
    
    if (!content.trim()) {
      setError('Введите текст комментария');
      return;
    }

    createComment.mutate({ ideaId, content });
  };

  return (
    <form onSubmit={handleSubmit} className={css.commentForm}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ваш комментарий..."
        rows={3}
        required
        disabled={createComment.isLoading}
      />
      {error && <div className={css.error}>{error}</div>}
      <button 
        type="submit" 
        disabled={createComment.isLoading || !content.trim()}
      >
        {createComment.isLoading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
}