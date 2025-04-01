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
};

export function CommentList({ comments, ideaId }: { comments?: CommentType[]; ideaId: string }) {
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
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();
  
  const { data: replies, isLoading: isLoadingReplies } = trpc.getReplies.useQuery(
    { parentId: comment.id },
    { enabled: showReplies && comment.repliesCount > 0 }
  );

  const createReply = trpc.createReply.useMutation({
    onSuccess: () => {
      utils.getReplies.invalidate({ parentId: comment.id });
      utils.getComments.invalidate({ ideaId });
      setShowReplyForm(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message || 'Произошла ошибка при создании ответа');
    }
  });

  const handleReplySubmit = (e: React.FormEvent, content: string) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Пожалуйста, введите текст ответа');
      return;
    }

    createReply.mutate({ 
      ideaId:ideaId,
      parentId: comment.id,
      content:content
    });
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
              onClick={() => setShowReplyForm(!showReplyForm)}
              className={css.replyButton}
              disabled={createReply.isLoading}
            >
              Ответить
            </button>
            
            {comment.repliesCount > 0 && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className={css.toggleRepliesBtn}
                disabled={isLoadingReplies}
              >
                {showReplies ? 'Скрыть ответы' : `Ответы (${comment.repliesCount})`}
              </button>
            )}
          </div>
          
          {showReplyForm && (
            <div className={css.replyContainer}>
              {error && <div className={css.error}>{error}</div>}
              <ReplyForm 
                onSubmit={handleReplySubmit} 
                onCancel={() => {
                  setShowReplyForm(false);
                  setError(null);
                }}
                isLoading={createReply.isLoading}
              />
            </div>
          )}
        </div>
      </div>
      
      {showReplies && (
        <div className={css.replies}>
          {isLoadingReplies ? (
            <p>Загрузка ответов...</p>
          ) : replies && replies.length > 0 ? (
            <CommentList comments={replies} ideaId={ideaId} />
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
      setContent('');
      setError(null);
      utils.getComments.invalidate({ ideaId });
    },
    onError: (error) => {
      setError(error.message || 'Произошла ошибка при создании комментария');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Пожалуйста, введите текст комментария');
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