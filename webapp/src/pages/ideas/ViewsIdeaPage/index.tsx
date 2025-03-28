
import { trpc } from '../../../lib/trpc';
import { Icon } from '../../../components/Icon'
import { Segment } from '../../../components/Segment';
import { getEditIdeaRoute, getViewIdeaRoute } from '../../../lib/routes'
import format from 'date-fns/format';
import { Alert } from '../../../components/Alert';
import { Button, LinkButton } from '../../../components/Button';
import { FormItems } from '../../../components/FormItems';
import css from './index.module.scss';
import { withPageWrapper } from '../../../lib/pageWrapper';
import type { TrpcRouterOutput } from '@forum_project/backend/src/router';
import { canBlockIdeas, canEditIdea } from '@forum_project/backend/src/utils/can';
import { useForm } from '../../../lib/form';
import { useState, useEffect } from 'react';

const LikeButton = ({ idea }: { idea: NonNullable<TrpcRouterOutput['getIdea']['idea']> }) => {
  const trpcUtils = trpc.useContext();
  const [liked, setLiked] = useState(idea.isLikedByMe);

  const setIdeaLike = trpc.setIdeaLike.useMutation({
    onMutate: ({ isLikedByMe }) => {
      setLiked(isLikedByMe); // Мгновенно меняем состояние для визуального отклика
      const oldGetIdeaData = trpcUtils.getIdea.getData({ someNick: idea.nick });
      if (oldGetIdeaData?.idea) {
        const newGetIdeaData = {
          ...oldGetIdeaData,
          idea: {
            ...oldGetIdeaData.idea,
            isLikedByMe,
            likesCount: oldGetIdeaData.idea.likesCount + (isLikedByMe ? 1 : -1),
          },
        };
        trpcUtils.getIdea.setData({ someNick: idea.nick }, newGetIdeaData);
      }
    },
    onSuccess: (data) => {
      setLiked(data.idea?.isLikedByMe || false); // Обновляем по данным с сервера
      void trpcUtils.getIdea.invalidate({ someNick: idea.nick });
    },
  });

  useEffect(() => {
    setLiked(idea.isLikedByMe); // Синхронизируем с сервером при загрузке
  }, [idea.isLikedByMe]);

  return (
    <button
      className={`${css.likeButton} transition-transform duration-300 active:scale-90`}
      onClick={() => {
        void setIdeaLike.mutateAsync({ ideaId: idea.id, isLikedByMe: !liked });
      }}
    >
      {/*<Heart
        size={32}
        className={`${css.heart} ${liked ? css.liked : css.unliked}`} // Динамически меняем класс
      />*/}
           <Icon size={32} className={css.likeIcon} name={idea.isLikedByMe ? 'likeFilled' : 'likeEmpty'} />
    </button>
  );
};


const BlockIdea = ({ idea }: { idea: NonNullable<TrpcRouterOutput['getIdea']['idea']> }) => {
  const blockIdea = trpc.blockIdea.useMutation();
  const trpcUtils = trpc.useContext();
  const { formik, alertProps, buttonProps } = useForm({
    onSubmit: async () => {
      await blockIdea.mutateAsync({ ideaId: idea.id });
      await trpcUtils.getIdea.refetch({ someNick: idea.nick });
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>
        <Alert {...alertProps} />
        <Button color="red" {...buttonProps}>
          Блокировать
        </Button>
      </FormItems>
    </form>
  );
};


export const ViewsIdeaPage = withPageWrapper({
  useQuery: () => {
    const { someNick } = getViewIdeaRoute.useParams()
    return trpc.getIdea.useQuery({ someNick });
  },
  setProps: ({ queryResult, checkExists, ctx }) => ({
    idea: checkExists(queryResult.data.idea, 'Обсуждение не найдено'),
    me: ctx.me,
  }),
  showLoaderOnFetching: false,
  title: ({ idea }) => idea.name,
})(({ idea, me }) => (
  <div className={css.twitterPostContainer}>
    <div className={css.postWrapper}>
      {/* Автор поста */}
      <div className={css.authorSection}>
        <div className={css.authorInfo}>
          <span className={css.authorName}>
            {idea.author.name || idea.author.nick}
          </span>
          <i className={`fas fa-check-circle ${css.verifiedIcon}`}></i>
          <span className={css.authorNick}>@{idea.author.nick}</span>
          <span className={css.authorNick}> {format(idea.createdAt, 'yyyy-MM-dd')}</span>
        </div>
      </div>
      
      {/* Текст поста */}
      <div className={css.postContent}>
        <div className={css.postTitle}>{idea.name}</div>
        <div className={css.postDescription}>{idea.description}</div>
        <div 
          className={css.text} 
          dangerouslySetInnerHTML={{ __html: idea.text }} 
        />
      </div>
      
      {/* Реакции */}
      <div className={css.reactions}>
        <div className={css.likes}>
        {me && <LikeButton idea={idea} />}
          <span className={css.likeCount}>
            {idea.likesCount} {idea.likesCount === 1 ? 'лайк' : 'лайков'}
          </span>
        </div>
      </div>
      {canEditIdea(me, idea) && (
          
            <LinkButton to={getEditIdeaRoute({ someNick: idea.nick })}>
              Редактировать
            </LinkButton>
          
        )}
      {/* Кнопки действий */}
      <div className={css.actions}>
        
        {canBlockIdeas(me) && (
          <div className={css.blockIdea}>
            <BlockIdea idea={idea} />
          </div>
        )}
      </div>
    </div>
  </div>
));

