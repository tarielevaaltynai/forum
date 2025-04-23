// Импорты
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
import { Icon } from '../../../components/Icon';
import { format } from 'date-fns';

const getLikeWord = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) return 'лайк';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'лайка';
  return 'лайков';
};

export const SomeUserPage = withPageWrapper({
  title: "Профиль пользователя",
  isTitleExact: false,
})(() => {
  // Получаем ник пользователя из URL-параметров
  const { someNick } = useParams<{ someNick: string }>();
  
  // Проверяем, что ник пользователя был передан
  if (!someNick) {
    return (
      <div className={css.page}>
        <Alert color="red">Не указан ник пользователя</Alert>
      </div>
    );
  }

  // Запрашиваем профиль пользователя по нику
  const { 
    data: userProfile, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = trpc.getUserProfileByNick.useQuery({ nick: someNick });

  // Запрашиваем идеи пользователя по нику
  const {
    data: ideasData,
    error: ideasError,
    isLoading: isIdeasLoading,
    isError: isIdeasError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = trpc.getUserIdeasByNick.useInfiniteQuery(
    { 
      limit: 10,
      search: someNick // Используем ник пользователя для фильтрации идей
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Мутация для лайков (если текущий пользователь авторизован)
  const likeIdea = trpc.setIdeaLike.useMutation({
    onSuccess: () => {
      // Можно добавить логику обновления счетчика лайков без перезагрузки всего списка
    }
  });

  return (
    <div className={css.page}>
      {/* Сегмент профиля */}
      <Segment title={`Профиль пользователя ${someNick}`} className={css.profileSegment}>
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
      <Segment title={`Идеи пользователя ${someNick}`}>
        {isIdeasLoading || isRefetching ? (
          <Loader type="section" />
        ) : isIdeasError ? (
          <Alert color="red">{ideasError.message}</Alert>
        ) : !ideasData?.pages[0]?.ideas.length ? (
          <Alert color="brown">Пользователь еще не добавил ни одной идеи</Alert>
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
                  <div className={css.idea} key={idea.id}>
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
                          className={`${css.likeIcon} ${idea.isLikedByMe ? css.likeIconFilled : ''} transition-transform duration-300 active:scale-90`}
                          name="likeFilled"
                          onClick={() => {
                            likeIdea.mutate({ 
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
    </div>
  );
});