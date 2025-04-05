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
  const { data, error, isLoading, isError, refetch } = trpc.getLikedIdeas.useQuery();

  const likeToggle = async (ideaId: string, isLikedByMe: boolean) => {
    await trpc.setIdeaLike.mutateAsync({ ideaId, isLikedByMe: !isLikedByMe });
    void refetch(); // обновим список после лайка
  };

  return (
    <Segment title="Избранное">
      {isLoading ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : !data?.length ? (
        <Alert color="brown">У вас нет понравившихся идей.</Alert>
      ) : (
        <div className={css.ideas}>
          {data.map((idea) => (
            <div className={css.idea} key={idea.id}>
              <Segment size={2}>
                {/* Автор */}
                <div className={css.author}>
                  <img
                    className={css.avatar}
                    src={getAvatarUrl(idea.author?.avatar ?? "default-avatar", "small")}
                    alt="avatar"
                  />
                  <div className={css.name}>
                    {idea.author?.nick ?? "Unknown"}
                    {idea.author?.name && <span> ({idea.author.name})</span>}
                  </div>
                </div>

                {/* Идея */}
                <div className={css.ideaContent}>
                  <Link className={css.ideaLink} to={getViewIdeaRoute({ someNick: idea.nick })}>
                    {idea.name}
                  </Link>
                  <div className={css.description}>{idea.description}</div>
                </div>

                {/* Лайки */}
                <div className={css.likes}>
                  <Icon
                    size={32}
                    className={`${css.likeIcon} ${css.likeIconFilled} transition-transform duration-300 active:scale-90`}
                    name="likeFilled"
                    onClick={() => likeToggle(idea.id, idea.isLikedByMe)}
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
        </div>
      )}
    </Segment>
  );
});
