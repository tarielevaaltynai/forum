import { trpc } from "../../../lib/trpc";
import { useParams } from "react-router-dom";
import { Segment } from "../../../components/Segment";
import { Icon } from "../../../components/Icon";
import {
  getEditIdeaRoute,
  type ViewIdeaRouteParams,
} from "../../../lib/routes";
import format from "date-fns/format";
import { LinkButton } from "../../../components/Button";
import css from "./index.module.scss";
import { withPageWrapper } from "../../../lib/pageWrapper";
import type { TrpcRouterOutput } from "@forum_project/backend/src/router";

const LikeButton = ({
  idea,
}: {
  idea: NonNullable<TrpcRouterOutput["getIdea"]["idea"]>;
}) => {
  const trpcUtils = trpc.useContext();
  const setIdeaLike = trpc.setIdeaLike.useMutation({
    onMutate: ({ isLikedByMe }) => {
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
    onSuccess: () => {
      void trpcUtils.getIdea.invalidate({ someNick: idea.nick });
    },
  });
  return (
    <button
      className={css.likeButton}
      onClick={() => {
        void setIdeaLike.mutateAsync({
          ideaId: idea.id,
          isLikedByMe: !idea.isLikedByMe,
        });
      }}
    >
      <Icon
        size={32}
        className={css.likeIcon}
        name={idea.isLikedByMe ? "likeFilled" : "likeEmpty"}
      />
    </button>
  );
};

export const ViewsIdeaPage = withPageWrapper({
  useQuery: () => {
    const { someNick } = useParams() as ViewIdeaRouteParams;
    console.log("someNick:", someNick);
    return trpc.getIdea.useQuery({
      someNick,
    });
  },
  setProps: ({ queryResult, checkExists, ctx }) => ({
    idea: checkExists(queryResult.data.idea, "Обсуждение не найдено"),

    me: ctx.me,
  }),
  showLoaderOnFetching: false,
  title: "New Idea",
})(({ idea, me }) => (
  <Segment title={idea.name} description={idea.description}>
    <div className={css.createdAt}>
      Создано: {format(idea.createdAt, "yyyy-MM-dd")}
    </div>

    <div className={css.author}>
      Автор: {idea.author.nick}
      {idea.author.name ? ` (${idea.author.name})` : ""}
    </div>

    <div className={css.text} dangerouslySetInnerHTML={{ __html: idea.text }} />
    <div className={css.likes}>
      Likes: {idea.likesCount}
      {me && (
        <>
          <br />
          <LikeButton idea={idea} />
        </>
      )}
    </div>
    {me?.id === idea.authorId && (
      <div className={css.editButton}>
        <LinkButton to={getEditIdeaRoute({ someNick: idea.nick })}>
          Редактировать
        </LinkButton>
      </div>
    )}
  </Segment>
));
