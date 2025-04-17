import { useState } from "react";
import { getViewIdeaRoute } from "../../../lib/routes";
import { trpc } from "../../../lib/trpc";
import { Segment } from "../../../components/Segment";
import { Link } from "react-router-dom";
import css from "./index.module.scss";
import { Alert } from "../../../components/Alert";
import InfiniteScroll from "react-infinite-scroller";
import { layoutContentElRef } from "../../../components/Layout";
import { Loader } from "../../../components/Loader";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { getAvatarUrl } from "@forum_project/shared/src/cloudinary";
import { Heart } from "lucide-react";
import cn from "classnames";

const getLikeWord = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) return "лайк";
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  )
    return "лайка";
  return "лайков";
};

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

  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = trpc.getMyIdeas.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const { mutateAsync: setLike } = trpc.setIdeaLike.useMutation({
    onSuccess: () => {
      utils.getMyIdeas.invalidate();
    },
  });

  const handleLike = async (ideaId: string, isLikedByMe: boolean) => {
    try {
      await setLike({
        ideaId,
        isLikedByMe: !isLikedByMe,
      });
    } catch (err) {
      console.error("Error setting like:", err);
    }
  };

  return (
    <div className={css.container}>
      {isLoading || isRefetching ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : !data?.pages[0]?.ideas.length ? (
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
            {data.pages
              .flatMap((page) => page.ideas)
              .map((idea) => (
                <div className={css.idea} key={idea.nick}>
                  <Segment size={2}>
                    {/* Автор */}
                    <div className={css.author}>
                      <img
                        className={css.avatar}
                        src={getAvatarUrl(idea.author?.avatar, "small")}
                        alt={`Аватар ${idea.author?.nick || "пользователя"}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/default-avatar.png";
                        }}
                      />
                      <div className={css.authorInfo}>
                        <div className={css.name}>
                          {idea.author?.nick ?? "Неизвестный автор"}
                        </div>
                        {idea.author?.name && (
                          <div className={css.meta}>@{idea.author.name}</div>
                        )}
                      </div>
                    </div>

                    {/* Контент идеи */}
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

                    {/* Лайки */}
                    <div className={css.likes}>
                      <button
                        className={cn(css.likeButton, {
                          [css.liked]: idea.isLikedByMe,
                        })}
                        onClick={() => handleLike(idea.id, idea.isLikedByMe)}
                        aria-label={
                          idea.isLikedByMe ? "Убрать лайк" : "Поставить лайк"
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
    </div>
  );
});
