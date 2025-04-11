// import { trpc } from "../../../lib/trpc";
// import { Icon } from "../../../components/Icon";
// import { Segment } from "../../../components/Segment";
// import { getEditIdeaRoute, getViewIdeaRoute } from "../../../lib/routes";
// import format from "date-fns/format";
// import { Alert } from "../../../components/Alert";
// import { Button, LinkButton } from "../../../components/Button";
// import { FormItems } from "../../../components/FormItems";
// import { BlockConfirm } from "../../../components/BlockConfirm";
// import css from "./index.module.scss";

// import { UserLink } from "../../../components/UserLink";

// import { withPageWrapper } from "../../../lib/pageWrapper";
// import type { TrpcRouterOutput } from "@forum_project/backend/src/router";
// import {
//   canBlockIdeas,
//   canEditIdea,
// } from "@forum_project/backend/src/utils/can";
// import { useForm } from "../../../lib/form";
// import { useState } from "react";
// import {
//   CommentList,
//   CreateCommentForm,
// } from "../../../components/CommentsList"; // Импортируем ваши компоненты

// const LikeButton = ({
//   idea,
// }: {
//   idea: NonNullable<TrpcRouterOutput["getIdea"]["idea"]>;
// }) => {
//   const trpcUtils = trpc.useContext();
//   const [liked, setLiked] = useState(idea.isLikedByMe);

//   const setIdeaLike = trpc.setIdeaLike.useMutation({
//     onMutate: ({ isLikedByMe }) => {
//       setLiked(isLikedByMe);
//       const oldGetIdeaData = trpcUtils.getIdea.getData({ someNick: idea.nick });
//       if (oldGetIdeaData?.idea) {
//         const newGetIdeaData = {
//           ...oldGetIdeaData,
//           idea: {
//             ...oldGetIdeaData.idea,
//             isLikedByMe,
//             likesCount: oldGetIdeaData.idea.likesCount + (isLikedByMe ? 1 : -1),
//           },
//         };
//         trpcUtils.getIdea.setData({ someNick: idea.nick }, newGetIdeaData);
//       }
//     },
//     onSuccess: (data) => {
//       setLiked(data.idea?.isLikedByMe || false);
//       void trpcUtils.getIdea.invalidate({ someNick: idea.nick });
//     },
//   });

//   return (
//     <button
//       className={`${css.likeButton} transition-transform duration-300 active:scale-90`}
//       onClick={() => {
//         void setIdeaLike.mutateAsync({ ideaId: idea.id, isLikedByMe: !liked });
//       }}
//     >
//       <Icon
//         size={32}
//         className={css.likeIcon}
//         name={liked ? "likeFilled" : "likeEmpty"}
//       />
//     </button>
//   );
// };

// const BlockIdea = ({
//   idea,
// }: {
//   idea: NonNullable<TrpcRouterOutput["getIdea"]["idea"]>;
// }) => {
//   const blockIdea = trpc.blockIdea.useMutation();
//   const trpcUtils = trpc.useContext();
//   const [showConfirmation, setShowConfirmation] = useState(false);

//   const { formik, alertProps, buttonProps } = useForm({
//     onSubmit: async () => {
//       await blockIdea.mutateAsync({ ideaId: idea.id });
//       await trpcUtils.getIdea.refetch({ someNick: idea.nick });
//       setShowConfirmation(false);
//     },
//   });

//   const handleConfirm = () => {
//     formik.submitForm();
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//   };

//   return (
//     <>
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           setShowConfirmation(true);
//         }}
//       >
//         <FormItems>
//           <Alert {...alertProps} />
//           <Button color="red" {...buttonProps}>
//             Блокировать
//           </Button>
//         </FormItems>
//       </form>

//       <BlockConfirm
//         isOpen={showConfirmation}
//         onConfirm={handleConfirm}
//         onCancel={handleCancel}
//         title="Подтверждение блокировки"
//         message="Вы точно хотите заблокировать это обсуждение?"
//       />
//     </>
//   );
// };

// const CommentSection = ({ ideaId }: { ideaId: string }) => {
//   const [showComments, setShowComments] = useState(false);
//   const { data: commentsData, isLoading } = trpc.getComments.useQuery(
//     { ideaId },
//     { enabled: showComments }
//   );

//   return (
//     <Segment className={css.commentSection}>
//       <button onClick={() => setShowComments(!showComments)}>
//         {showComments ? "Скрыть комментарии" : "Показать комментарии"}
//         {!showComments && commentsData && ` (${commentsData.comments.length})`}
//       </button>

//       {showComments && (
//         <div className={css.commentsContainer}>
//           {isLoading ? (
//             <div>Загрузка комментариев...</div>
//           ) : (
//             <>
//               <CommentList
//                 comments={commentsData?.comments}
//                 ideaId={ideaId} // <- Важно передать ideaId
//               />
//               <CreateCommentForm ideaId={ideaId} />
//             </>
//           )}
//         </div>
//       )}
//     </Segment>
//   );
// };
// export const ViewsIdeaPage = withPageWrapper({
//   useQuery: () => {
//     const { someNick } = getViewIdeaRoute.useParams();
//     return trpc.getIdea.useQuery({ someNick });
//   },
//   setProps: ({ queryResult, checkExists, ctx }) => ({
//     idea: checkExists(queryResult.data.idea, "Обсуждение не найдено"),
//     me: ctx.me,
//   }),
//   showLoaderOnFetching: false,
//   title: ({ idea }) => idea.name,
// })(({ idea, me }) => (
//   <div className={css.twitterPostContainer}>
//     <div className={css.postWrapper}>
//       {/* Автор поста */}
//       <div className={css.authorSection}>
//         <div className={css.authorInfo}>
//           <span className={css.authorName}>
//             {idea.author.name || idea.author.nick}
//           </span>
//           <i className={`fas fa-check-circle ${css.verifiedIcon}`}></i>
//           <span className={css.authorNick}>@{idea.author.nick} · </span>
//           <span className={css.postDate}>
//             {format(idea.createdAt, "yyyy-MM-dd")}
//           </span>
//         </div>
//       </div>

//       {/* Содержимое поста */}
//       <div className={css.postContent}>
//         <h1 className={css.postTitle}>{idea.name}</h1>
//         <div className={css.postDescription}>{idea.description}</div>
//         <div
//           style={{ whiteSpace: "pre-wrap" }}
//           className={css.text}
//           dangerouslySetInnerHTML={{ __html: idea.text }}
//         />
//       </div>

//       {/* Лайки и действия */}
//       <div className={css.postFooter}>
//         <div className={css.reactions}>
//           {me && <LikeButton idea={idea} />}
//           <span className={css.likeCount}>
//             {idea.likesCount} {idea.likesCount === 1 ? "лайк" : "лайков"}
//           </span>
//         </div>

//         <div className={css.actions}>
//           {canEditIdea(me, idea) && (
//             <LinkButton
//               to={getEditIdeaRoute({ someNick: idea.nick })}
//               className={css.editButton}
//             >
//               Редактировать
//             </LinkButton>
//           )}
//           {canBlockIdeas(me) && (
//             <div className={css.blockIdea}>
//               <BlockIdea idea={idea} />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Секция комментариев */}
//       <CommentSection ideaId={idea.id} />
//     </div>
//   </div>
// ));



import { trpc } from "../../../lib/trpc";
import { Icon } from "../../../components/Icon";
import { Segment } from "../../../components/Segment";
import { getEditIdeaRoute, getViewIdeaRoute } from "../../../lib/routes";
import format from "date-fns/format";
import { Alert } from "../../../components/Alert";
import { Button, LinkButton } from "../../../components/Button";
import { FormItems } from "../../../components/FormItems";
import { BlockConfirm } from "../../../components/BlockConfirm";
import css from "./index.module.scss";
import { withPageWrapper } from "../../../lib/pageWrapper";
import type { TrpcRouterOutput } from "@forum_project/backend/src/router";
import {
  canBlockIdeas,
  canEditIdea,
} from "@forum_project/backend/src/utils/can";
import { useForm } from "../../../lib/form";
import { useState } from "react";
import {
  CommentList,
  CreateCommentForm,
} from "../../../components/CommentsList";
import { UserLink } from "../../../components/UserLink"; // Добавлен импорт UserLink

const LikeButton = ({
  idea,
}: {
  idea: NonNullable<TrpcRouterOutput["getIdea"]["idea"]>;
}) => {
  const trpcUtils = trpc.useContext();
  const [liked, setLiked] = useState(idea.isLikedByMe);

  const setIdeaLike = trpc.setIdeaLike.useMutation({
    onMutate: ({ isLikedByMe }) => {
      setLiked(isLikedByMe);
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
      setLiked(data.idea?.isLikedByMe || false);
      void trpcUtils.getIdea.invalidate({ someNick: idea.nick });
    },
  });

  return (
    <button
      className={`${css.likeButton} transition-transform duration-300 active:scale-90`}
      onClick={() => {
        void setIdeaLike.mutateAsync({ ideaId: idea.id, isLikedByMe: !liked });
      }}
    >
      <Icon
        size={32}
        className={css.likeIcon}
        name={liked ? "likeFilled" : "likeEmpty"}
      />
    </button>
  );
};

const BlockIdea = ({
  idea,
}: {
  idea: NonNullable<TrpcRouterOutput["getIdea"]["idea"]>;
}) => {
  const blockIdea = trpc.blockIdea.useMutation();
  const trpcUtils = trpc.useContext();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { formik, alertProps, buttonProps } = useForm({
    onSubmit: async () => {
      await blockIdea.mutateAsync({ ideaId: idea.id });
      await trpcUtils.getIdea.refetch({ someNick: idea.nick });
      setShowConfirmation(false);
    },
  });

  const handleConfirm = () => {
    formik.submitForm();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmation(true);
        }}
      >
        <FormItems>
          <Alert {...alertProps} />
          <Button color="red" {...buttonProps}>
            Блокировать
          </Button>
        </FormItems>
      </form>

      <BlockConfirm
        isOpen={showConfirmation}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Подтверждение блокировки"
        message="Вы точно хотите заблокировать это обсуждение?"
      />
    </>
  );
};

const CommentSection = ({ ideaId }: { ideaId: string }) => {
  const [showComments, setShowComments] = useState(false);
  const { data: commentsData, isLoading } = trpc.getComments.useQuery(
    { ideaId },
    { enabled: showComments }
  );

  return (
    <Segment className={css.commentSection}>
      <button onClick={() => setShowComments(!showComments)}>
        {showComments ? "Скрыть комментарии" : "Показать комментарии"}
        {!showComments && commentsData && ` (${commentsData.comments.length})`}
      </button>

      {showComments && (
        <div className={css.commentsContainer}>
          {isLoading ? (
            <div>Загрузка комментариев...</div>
          ) : (
            <>
              <CommentList
                comments={commentsData?.comments}
                ideaId={ideaId}
              />
              <CreateCommentForm ideaId={ideaId} />
            </>
          )}
        </div>
      )}
    </Segment>
  );
};

export const ViewsIdeaPage = withPageWrapper({
  useQuery: () => {
    const { someNick } = getViewIdeaRoute.useParams();
    return trpc.getIdea.useQuery({ someNick });
  },
  setProps: ({ queryResult, checkExists, ctx }) => ({
    idea: checkExists(queryResult.data.idea, "Обсуждение не найдено"),
    me: ctx.me,
  }),
  showLoaderOnFetching: false,
  title: ({ idea }) => idea.name,
})(({ idea, me }) => (
  <div className={css.twitterPostContainer}>
    <div className={css.postWrapper}>
      {/* Автор поста с ссылкой на профиль */}
      <div className={css.authorSection}>
        <div className={css.authorInfo}>
          <UserLink
            userId={idea.author.id}
            nick={idea.author.nick}
            name={idea.author.name || idea.author.nick}
            showFullName={true}
            className={css.authorLink}
          />
          <i className={`fas fa-check-circle ${css.verifiedIcon}`}></i>
          <span className={css.postDate}>
            {format(idea.createdAt, "yyyy-MM-dd")}
          </span>
        </div>
      </div>

      {/* Содержимое поста */}
      <div className={css.postContent}>
        <h1 className={css.postTitle}>{idea.name}</h1>
        <div className={css.postDescription}>{idea.description}</div>
        <div
          style={{ whiteSpace: "pre-wrap" }}
          className={css.text}
          dangerouslySetInnerHTML={{ __html: idea.text }}
        />
      </div>

      {/* Лайки и действия */}
      <div className={css.postFooter}>
        <div className={css.reactions}>
          {me && <LikeButton idea={idea} />}
          <span className={css.likeCount}>
            {idea.likesCount} {idea.likesCount === 1 ? "лайк" : "лайков"}
          </span>
        </div>

        <div className={css.actions}>
          {canEditIdea(me, idea) && (
            <LinkButton
              to={getEditIdeaRoute({ someNick: idea.nick })}
              className={css.editButton}
            >
              Редактировать
            </LinkButton>
          )}
          {canBlockIdeas(me) && (
            <div className={css.blockIdea}>
              <BlockIdea idea={idea} />
            </div>
          )}
        </div>
      </div>

      {/* Секция комментариев */}
      <CommentSection ideaId={idea.id} />
    </div>
  </div>
));