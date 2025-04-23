import { trpc } from "../../../lib/trpc";
import { Segment } from "../../../components/Segment";
import { Link } from "react-router-dom";
import css from "../AllIdeasPage/index.module.scss";
import { Alert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { getAvatarUrl } from "@forum_project/shared/src/cloudinary";
import { Icon } from "../../../components/Icon";
import { getViewIdeaRoute } from "../../../lib/routes";
import InfiniteScroll from "react-infinite-scroller";
import { layoutContentElRef } from "../../../components/Layout";

const getLikeWord = (count: number) => {
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

export const LikedIdeasPage = withPageWrapper({
  title: "Понравившиеся идеи",
  isTitleExact: true,
})(() => {
  const { data, error, isLoading, isError, refetch } =
    trpc.getLikedIdeas.useQuery();

  const likeToggle = async (ideaId: string, isLikedByMe: boolean) => {
    await trpc.setIdeaLike.mutateAsync({ ideaId, isLikedByMe: !isLikedByMe });
    void refetch();
  };

  return (
    <div className={css.container}>
      {isLoading ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : !data?.length ? (
        <Alert color="brown">У вас нет понравившихся идей</Alert>
      ) : (
        <div className={css.ideas}>

          <InfiniteScroll
            pageStart={0}
            loadMore={() => {}}
            hasMore={false}
            getScrollParent={() => layoutContentElRef.current}
            useWindow={
              getComputedStyle(layoutContentElRef.current!).overflow !== "auto"
            }
          >
            {data.map((idea) => (
              <div className={css.idea} key={idea.id}>
                <Segment size={2}>
                  <div className={css.author}>
                    <img
                      className={css.avatar}
                      src={
                        getAvatarUrl(idea.author.avatar, "small") || avatar
                      }
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

                  <div className={css.ideaContent}>
                    <Link
                      className={css.ideaLink}
                      to={getViewIdeaRoute({ someNick: idea.nick })}
                    >
                      {idea.name}
                    </Link>
                    <div className={css.description}>{idea.description}</div>
                  </div>

                  <div className={css.likes}>
                    <Icon
                      size={20}
                      className={`${css.likeIcon} ${idea.isLikedByMe ? css.likeIconFilled : ""}`}
                      name="likeFilled"
                      onClick={() => likeToggle(idea.id, idea.isLikedByMe)}
                      role="button"
                      aria-label={
                        idea.isLikedByMe ? "Убрать лайк" : "Поставить лайк"
                      }
                      tabIndex={0}
                    />
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
