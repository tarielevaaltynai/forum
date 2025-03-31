import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import css from './index.module.scss';

export function CommentList({ comments }: { comments?: any[] }) {
  if (!comments || comments.length === 0) {
    return <p>Комментариев пока нет.</p>; // или другой текст по желанию
  }

  return (
    <div className={css.commentList}>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}


export function CommentItem({ comment }: { comment: any }) {
  const [showReplies, setShowReplies] = useState(false);
  const { data: replies } = trpc.getReplies.useQuery(
    { parentId: comment.id },
    { enabled: showReplies && comment.repliesCount > 0 }
  );

  return (
    <div className={css.comment}>
      <div className={css.commentContent}>
        <p>{comment.content}</p>
        <small>Автор: {comment.author.nick}</small>
      </div>
      
      {comment.repliesCount > 0 && (
        <button 
          onClick={() => setShowReplies(!showReplies)}
          className={css.toggleRepliesBtn}
        >
          {showReplies ? 'Скрыть ответы' : `Показать ответы (${comment.repliesCount})`}
        </button>
      )}
      
      {showReplies && replies && (
        <div className={css.replies}>
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateCommentForm({ ideaId }: { ideaId: string }) {
  const [content, setContent] = useState('');
  const utils = trpc.useContext();
  
  const createComment = trpc.createComment.useMutation({
    onSuccess: () => {
      setContent('');
      utils.getComments.invalidate({ ideaId });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createComment.mutate({ ideaId, content });
  };

  return (
    <form onSubmit={handleSubmit} className={css.commentForm}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ваш комментарий..."
        rows={3}
      />
      <button type="submit" disabled={createComment.isLoading}>
        {createComment.isLoading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
}