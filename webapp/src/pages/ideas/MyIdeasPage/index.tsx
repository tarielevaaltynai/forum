// Импорты оставим без изменений
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

import { getAvatarUrl } from '@forum_project/shared/src/cloudinary';
import { Icon } from '../../../components/Icon';
import { format } from 'date-fns';


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
    }
  );

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = trpc.getUserProfile.useQuery();

  return (
    <div className={css.page}>
      {/* Сегмент профиля */}
      <Segment title="Мой профиль" className={css.profileSegment}>
        {isProfileLoading ? (
          <Loader type="section" />
        ) : profileError ? (
          <Alert color="red">Ошибка загрузки профиля: {profileError.message}</Alert>
        ) : userProfile ? (
          <div className={css.profile}>
            <img
              className={css.profileAvatar}
              src={getAvatarUrl(userProfile.avatar, "small")}
              alt="Аватар пользователя"
            />
            <div className={css.profileInfo}>
              <h2 className={css.profileNick}>{userProfile.nick}</h2>
              {userProfile.name && <p>Имя: {userProfile.name}</p>}
              {userProfile.surname && <p>Фамилия: {userProfile.surname}</p>}
              {userProfile.gender && <p>Пол: {userProfile.gender}</p>}
              {userProfile.birthDate && (
                <p>Дата рождения: {format(new Date(userProfile.birthDate), 'dd.MM.yyyy')}</p>
              )}
              <p>Идей: {userProfile.ideasCount}</p>
              <p>На сайте с {format(new Date(userProfile.createdAt), 'dd.MM.yyyy')}</p>
              {userProfile.specialty && <p>Специальность: {userProfile.specialty}</p>}
            </div>
          </div>
        ) : (
          <Alert color="brown">Профиль не найден</Alert>
        )}
      </Segment>

      {/* Сегмент идей */}
      <Segment title="Мои идеи">
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
                  getComputedStyle(layoutContentElRef.current).overflow) !== "auto"
              }
            >
              {ideasData.pages
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
                          {idea.author?.nick ?? 'Unknown'}
                          {idea.author?.name && <span> ({idea.author.name})</span>}
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
