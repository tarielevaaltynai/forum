import type { TrpcRouterOutput } from "@forum_project/backend/src/router";

import {
  getAvatarUrl,
  getCloudinaryUploadUrl,
} from "@forum_project/shared/src/cloudinary";
import ImageGallery from "react-image-gallery";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { trpc } from "../../../lib/trpc";
import format from "date-fns/format";

import css from "./index.module.scss";
import {
  CommentList,
  CreateCommentForm,
} from "../../../components/CommentsList";
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  getAllIdeasRoute,
  getEditIdeaRoute,
  getViewIdeaRoute,
} from "../../../lib/routes";
import { Alert } from "../../../components/Alert";
import { BlockConfirm } from "../../../components/BlockConfirm";
import { Button, LinkButton } from "../../../components/Button";
import { FormItems } from "../../../components/FormItems";
import { Segment } from "../../../components/Segment";
import {
  canBlockIdeas,
  canEditIdea,
} from "@forum_project/backend/src/utils/can";

import { useForm } from "../../../lib/form";
import { Icon } from "../../../components/Icon";

const getLikeWord = (count) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return "лайк";
  } else if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  ) {
    return "лайка";
  } else {
    return "лайков";
  }
};

export const LikeButton = ({
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

  const handleClick = () => {
    void setIdeaLike.mutateAsync({ ideaId: idea.id, isLikedByMe: !liked });
  };

  return (
    <Icon
      size={32}
      className={`${css.likeIcon} transition-transform duration-300 active:scale-90`}
      name={liked ? "likeFilled" : "likeEmpty"}
      onClick={handleClick}
      role="button"
      aria-label="Лайк"
      tabIndex={0}
    />
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
      <button
        onClick={() => setShowComments(!showComments)}
        className={`${css.toggleCommentsButton} ${showComments ? css.opened : ""}`}
        aria-label={
          showComments ? "Скрыть комментарии" : "Показать комментарии"
        }
      >
        {showComments
          ? "Скрыть комментарии"
          : `Показать комментарии ${commentsData ? `(${commentsData.comments.length})` : ""}`}
      </button>

      {showComments && (
        <div className={css.commentsContainer}>
          {isLoading ? (
            <div>Загрузка комментариев...</div>
          ) : (
            <>
              <CommentList comments={commentsData?.comments} ideaId={ideaId} />
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
})(({ idea, me }) => {
  return (
    <div className={css.container}>
      <div className={css.twitterPostContainer}>
        <div className={css.postWrapper}>
          {/* Автор поста */}
          <div className={css.authorSection}>
            <img
              className={css.avatar}
              alt="avatar"
              src={getAvatarUrl(idea.author.avatar, "small")}
            />
            <div className={css.authorDetails}>
              <div className={css.authorName}>
                <Link
                  to={`/ideas/${idea.author.nick}/profile`}
                  className={css.authorNick}
                >
                  @{idea.author.nick}
                </Link>

                {idea.author.name && (
                  <span className={css.authorRealName}>
                    {" "}
                    ({idea.author.name})
                  </span>
                )}
              </div>

              {/* Специальность автора */}
              {idea.author.specialty && idea.author.isVerified && (
                <div className={css.specialty}>
                  {idea.author.specialty
                    ? `Специализация: ${idea.author.specialty}`
                    : "Нет специальности"}
                </div>
              )}

              <div className={css.createdAt}>
                {format(idea.createdAt, "yyyy-MM-dd")}
              </div>
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
            {!!idea.images.length && (
              <div className={css.gallery}>
                <ImageGallery
                  showPlayButton={false}
                  showFullscreenButton={false}
                  items={idea.images.map((image) => ({
                    original: getCloudinaryUploadUrl(image, "image", "large"),
                    thumbnail: getCloudinaryUploadUrl(
                      image,
                      "image",
                      "preview"
                    ),
                  }))}
                />
              </div>
            )}
          </div>

          {/* Лайки и действия */}
          <div className={css.postFooter}>
            <div className={css.reactions}>
              {me && <LikeButton idea={idea} />}
              <span className={css.likeCount}>
                {idea.likesCount} {getLikeWord(idea.likesCount)}
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
    </div>
  );
});
export const MyIdeasPage = withPageWrapper({
  title: "Мои идеи",
  isTitleExact: true,
})(() => {
  const [expandedIdeas, setExpandedIdeas] = useState<Record<string, boolean>>(
    {}
  );
  const utils = trpc.useUtils();

  const toggleExpand = (ideaId: string) => {
    setExpandedIdeas((prev) => ({
      ...prev,
      [ideaId]: !prev[ideaId],
    }));
  };

  const handleLike = async (ideaId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await trpc.unlikeIdea.mutate({ ideaId });
      } else {
        await trpc.likeIdea.mutate({ ideaId });
      }
      await utils.getMyIdeas.invalidate();
    } catch (err) {
      console.error("Ошибка при лайке:", err);
    }
  };

  const {
    data: ideasData,
    error: ideasError,
    isLoading: isIdeasLoading,
    isError: isIdeasError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = trpc.getMyIdeas.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // Добавляем опцию, чтобы запрос всегда выполнялся
      enabled: true,
    }
  );

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = trpc.getUserProfile.useQuery(undefined, {
    // Добавляем опцию, чтобы запрос всегда выполнялся
    enabled: true,
  });

  return (
    <div className={css.page}>
      <div className={css.container}>
        <h1 className={css.pageTitle}>Мои идеи</h1>

        <Segment title="" className={css.profileSegment}>
          {isProfileLoading ? (
            <Loader type="section" />
          ) : profileError ? (
            <Alert color="red">
              Ошибка загрузки профиля: {profileError.message}
            </Alert>
          ) : userProfile ? (
            <div className={css.profileContainer}>
              <div className={css.profileHeader}>
                <img
                  className={css.profileAvatar}
                  src={getAvatarUrl(userProfile.avatar, "small")}
                  alt="Аватар"
                />
                <div className={css.profileInfo}>
                  <div className={css.nameWrapper}>
                    <h2 className={css.profileName}>
                      {userProfile.name} {userProfile.surname}
                    </h2>
                    <span className={css.profileUsername}>
                      @{userProfile.nick}
                    </span>
                  </div>

                  <div className={css.profileDetails}>
                    {userProfile.birthDate && (
                      <div className={css.detailItem}>
                        <span>
                          Год рождения:{" "}
                          {format(new Date(userProfile.birthDate), "yyyy")}
                        </span>
                      </div>
                    )}

                    <div className={css.detailItem}>
                      <span>Идей: {userProfile.ideasCount}</span>
                    </div>
                  </div>

                  {userProfile.specialist?.isVerified && (
                    <span className={css.specialty}>
                      Специальность: {userProfile.specialist.specialty}
                    </span>
                  )}

                  <span className={css.joinDate}>
                    На сайте с{" "}
                    {format(new Date(userProfile.createdAt), "MMMM yyyy")}
                  </span>
                </div>
                <Link to="/edit-profile" className={css.editButton}>
                  Редактировать
                </Link>
              </div>
            </div>
          ) : (
            <Alert color="brown">Профиль не найден</Alert>
          )}
        </Segment>

        <Segment title="">
          {isIdeasLoading || isRefetching ? (
            <Loader type="section" />
          ) : isIdeasError ? (
            <Alert color="red">{ideasError.message}</Alert>
          ) : !ideasData?.pages[0]?.ideas.length ? (
            <Alert color="brown">Вы ещё не добавили ни одной идеи</Alert>
          ) : (
            <div className={css.ideas}>
              <InfiniteScroll
                threshold={250}
                loadMore={() => {
                  if (!isFetchingNextPage && hasNextPage) {
                    void fetchNextPage();
                  }
                }}
                hasMore={hasNextPage}
                loader={
                  <div className={css.more} key="loader">
                    <Loader type="section" />
                  </div>
                }
                getScrollParent={() => layoutContentElRef.current}
                useWindow={
                  (layoutContentElRef.current &&
                    getComputedStyle(layoutContentElRef.current).overflow) !==
                  "auto"
                }
              >
                {ideasData.pages
                  .flatMap((page) => page.ideas)
                  .map((idea) => (
                    <div className={css.idea} key={idea.id}>
                      <Segment size={2}>
                        <div className={css.author}>
                          <img
                            className={css.avatar}
                            src={getAvatarUrl(idea.author.avatar, "small")}
                            alt="Аватар автора"
                          />
                          <div className={css.name}>
                            {idea.author?.nick ?? "Unknown"}
                            {idea.author?.name && (
                              <span> ({idea.author.name})</span>
                            )}
                          </div>
                        </div>

                        <div className={css.ideaContent}>
                          <Link
                            className={css.ideaLink}
                            to={getViewIdeaRoute({ someNick: idea.nick })}
                          >
                            {idea.name}
                          </Link>

                          {idea.description && (
                            <div className={css.textContainer}>
                              <div
                                className={cn(css.ideaText, {
                                  [css.expanded]: expandedIdeas[idea.id],
                                })}
                              >
                                {idea.description}
                              </div>
                              {idea.description.length > 200 && (
                                <button
                                  onClick={() => toggleExpand(idea.id)}
                                  className={css.showMoreBtn}
                                >
                                  {expandedIdeas[idea.id]
                                    ? "Свернуть"
                                    : "Показать ещё"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={css.likes}>
                          <button
                            className={cn(css.likeButton, {
                              [css.liked]: idea.isLikedByMe,
                            })}
                            onClick={() =>
                              handleLike(idea.id, idea.isLikedByMe)
                            }
                            aria-label={
                              idea.isLikedByMe
                                ? "Убрать лайк"
                                : "Поставить лайк"
                            }
                          >
                            <Heart
                              size={20}
                              className={css.heartIcon}
                              fill={idea.isLikedByMe ? "currentColor" : "none"}
                            />
                          </button>
                          <span className={css.likeCount}>
                            {idea.likesCount} {getLikeWord(idea.likesCount)}
                          </span>
                        </div>
                      </Segment>
                    </div>
                  ))}
              </InfiniteScroll>
            </div>
          )}
        </Segment>
      </div>
    </div>
  );
});