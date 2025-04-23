import { getViewIdeaRoute } from "../../../lib/routes";
import { trpc } from "../../../lib/trpc";
import { Segment } from "../../../components/Segment";
import { Link, useParams } from "react-router-dom";
import css from "./index.module.scss";
import { Alert } from "../../../components/Alert";
import InfiniteScroll from "react-infinite-scroller";
import { layoutContentElRef } from "../../../components/Layout";
import { Loader } from "../../../components/Loader";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { getAvatarUrl } from '@forum_project/shared/src/cloudinary';
import { format } from 'date-fns';
import cn from "classnames";
import { useState } from "react";
import { Heart } from "lucide-react";

const getLikeWord = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) return 'лайк';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'лайка';
  return 'лайков';
};

export const SomeUserPage = withPageWrapper({
  title: "Профиль пользователя",
  isTitleExact: false,
})(() => {
  const { someNick } = useParams<{ someNick: string }>();
  const [expandedIdeas, setExpandedIdeas] = useState<Record<string, boolean>>({});
  const utils = trpc.useUtils();

  const toggleExpand = (ideaId: string) => {
    setExpandedIdeas(prev => ({ ...prev, [ideaId]: !prev[ideaId] }));
  };

  if (!someNick) {
    return (
      <div className={css.page}>
        <Alert color="red">Не указан ник пользователя</Alert>
      </div>
    );
  }

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = 
    trpc.getUserProfileByNick.useQuery({ nick: someNick });

  const { data: ideasData, error: ideasError, isLoading: isIdeasLoading,
    hasNextPage, fetchNextPage, isFetchingNextPage, isRefetching } = 
    trpc.getUserIdeasByNick.useInfiniteQuery(
      { limit: 10, search: someNick },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const likeIdea = trpc.setIdeaLike.useMutation({
    onSuccess: () => utils.getUserIdeasByNick.invalidate()
  });

  return (
    <div className={css.page}>
      <Segment title="" className={css.profileSegment}>
        {isProfileLoading ? (
          <Loader type="section" />
        ) : profileError ? (
          <Alert color="red">Ошибка загрузки профиля: {profileError.message}</Alert>
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
  </div>
  
  {/* Ник теперь под именем */}
  <span className={css.profileUsername}>@{userProfile.nick}</span>
  
  <div className={css.profileDetails}>
    {userProfile.birthDate && (
      <div className={css.detailItem}>
        <span>
          Год рождения: {format(new Date(userProfile.birthDate), 'yyyy')}
        </span>
      </div>
    )}
    <div className={css.detailItem}>
      <span>Идей: {userProfile.ideasCount}</span>
    </div>
  </div>

  {userProfile.specialty && (
    <span className={css.specialty}>
      Специальность: {userProfile.specialty}
    </span>
  )}

  <span className={css.joinDate}>
    На сайте с {format(new Date(userProfile.createdAt), "MMMM yyyy")}
  </span>
</div>

            </div>
          </div>
        ) : (
          <Alert color="brown">Профиль не найден</Alert>
        )}
      </Segment>

      <Segment title={``}>
        {isIdeasLoading || isRefetching ? (
          <Loader type="section" />
        ) : ideasError ? (
          <Alert color="red">{ideasError.message}</Alert>
        ) : !ideasData?.pages[0]?.ideas.length ? (
          <Alert color="brown">Пользователь еще не добавил ни одной идеи</Alert>
        ) : (
          <div className={css.ideas}>
            <InfiniteScroll
              threshold={250}
              loadMore={() => !isFetchingNextPage && hasNextPage && fetchNextPage()}
              hasMore={hasNextPage}
              loader={<div className={css.more}><Loader type="section" /></div>}
              getScrollParent={() => layoutContentElRef.current}
              useWindow={getComputedStyle(layoutContentElRef.current!).overflow !== "auto"}
            >
              {ideasData.pages.flatMap(page => page.ideas).map(idea => (
                <div className={css.idea} key={idea.id}>
                  <Segment size={2}>
                    <div className={css.author}>
                      <img
                        className={css.avatar}
                        src={getAvatarUrl(idea.author.avatar, "small")}
                        alt="Аватар автора"
                      />
                      <div className={css.authorInfo}>
                        <div className={css.name}>
                          @{idea.author?.nick ?? 'Unknown'}
                        </div>
                        <div className={css.meta}>
                          {idea.author?.name && <span>{idea.author.name}</span>}
                          {idea.author?.specialty && (
                            <span> • {idea.author.specialty}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={css.ideaContent}>
                      <Link className={css.ideaLink} to={getViewIdeaRoute({ someNick: idea.nick })}>
                        {idea.name}
                      </Link>
                      {idea.description && (
                        <div className={css.textContainer}>
                          <div className={cn(css.ideaText, { 
                            [css.expanded]: expandedIdeas[idea.id] 
                          })}>
                            {idea.description}
                          </div>
                          {idea.description.length > 200 && (
                            <button
                              onClick={() => toggleExpand(idea.id)}
                              className={css.showMoreBtn}
                            >
                              {expandedIdeas[idea.id] ? "Свернуть" : "Показать ещё"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={css.likes}>
                      <button
                        className={cn(css.likeButton, { 
                          [css.liked]: idea.isLikedByMe 
                        })}
                        onClick={() => likeIdea.mutate({ 
                          ideaId: idea.id, 
                          isLikedByMe: !idea.isLikedByMe 
                        })}
                        aria-label={idea.isLikedByMe ? "Убрать лайк" : "Поставить лайк"}
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
  );
});