import { getViewIdeaRoute } from "../../lib/routes"; 
import { trpc } from "../../lib/trpc";
import { Segment } from "../../components/Segment";
import { Link, useParams } from "react-router-dom";
import css from "./index.module.scss";
import { Alert } from "../../components/Alert";
import InfiniteScroll from "react-infinite-scroller";
import { layoutContentElRef } from "../../components/Layout";
import { Loader } from "../../components/Loader";
import { withPageWrapper } from "../../lib/pageWrapper";
import { getAvatarUrl } from '@forum_project/shared/src/cloudinary';
import { Icon } from '../../components/Icon';

const getLikeWord = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) return 'лайк';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'лайка';
  return 'лайков';
};

export const UserIdeasPage = withPageWrapper({
  title: "Идеи пользователя",
  isTitleExact: false,
})(() => {
  const { nick } = useParams<{ nick: string }>();
  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = trpc.getUserIdeas.useInfiniteQuery(
    { nick: nick!, limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <Segment title={`Идеи ${nick || 'пользователя'}`}>
      {isLoading || isRefetching ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : !data?.pages[0]?.ideas.length ? (
        <Alert color="brown">Этот пользователь ещё не добавил ни одной идеи</Alert>
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
                getComputedStyle(layoutContentElRef.current).overflow) !== "auto"
            }
          >
            {data.pages
              .flatMap((page) => page.ideas)
              .map((idea) => (
                <div className={css.idea} key={idea.nick}>
                  <Segment size={2}>
                    <div className={css.author}>
                      <img
                        className={css.avatar}
                        src={getAvatarUrl(idea.author.avatar, "small")}
                        alt="Аватар автора"
                      />
                      <div className={css.name}>
                        <Link to={`/users/${idea.author?.nick ?? 'unknown'}/ideas`}>
                          {idea.author?.nick ?? 'Unknown'}
                        </Link>
                        {idea.author?.name && <span> ({idea.author.name})</span>}
                      </div>
                    </div>

                    <div className={css.ideaContent}>
                      <Link className={css.ideaLink} to={getViewIdeaRoute({ someNick: idea.nick })}>
                        {idea.name}
                      </Link>
                      <div className={css.description}>
                        {idea.description}
                      </div>
                    </div>

                    <div className={css.likes}>
                      <Icon
                        size={32}
                        className={`${css.likeIcon} ${css.likeIconFilled} transition-transform duration-300 active:scale-90`}
                        name="likeFilled"
                        onClick={() => {
                          trpc.setIdeaLike.mutateAsync({ 
                            ideaId: idea.id, 
                            isLikedByMe: !idea.isLikedByMe 
                          });
                        }}
                        role="button"
                        aria-label="Лайк"
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
    </Segment>
  );
});