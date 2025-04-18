// import { getViewIdeaRoute } from "../../../lib/routes";
// import { trpc } from "../../../lib/trpc";
// import { Segment } from "../../../components/Segment";
// import { Link } from "react-router-dom";
// import css from "./index.module.scss";
// import { Alert } from "../../../components/Alert";
// import InfiniteScroll from "react-infinite-scroller";
// import { layoutContentElRef } from "../../../components/Layout";
// import { Loader } from "../../../components/Loader";
// import { useDebounce } from "usehooks-ts";
// import { withPageWrapper } from "../../../lib/pageWrapper";
// import { getAvatarUrl } from "@forum_project/shared/src/cloudinary";
// import { Icon } from "../../../components/Icon";
// import { Input } from "../../../components/Input";
// import { useForm } from "../../../lib/form";
// import { zGetIdeasTrpcInput } from "@forum_project/backend/src/router/ideas/getIdeas/input";

// const getLikeWord = (count) => {
//   if (count % 10 === 1 && count % 100 !== 11) {
//     return "лайк";
//   } else if (
//     count % 10 >= 2 &&
//     count % 10 <= 4 &&
//     (count % 100 < 10 || count % 100 >= 20)
//   ) {
//     return "лайка";
//   } else {
//     return "лайков";
//   }
// };

// export const AllIdeasPage = withPageWrapper({
//   title: "Beauty and Health",
//   isTitleExact: true,
// })(() => {
//   const { formik } = useForm({
//     initialValues: { search: "" },
//     validationSchema: zGetIdeasTrpcInput.pick({ search: true }),
//   });
//   const search = useDebounce(formik.values.search, 500);
//   const {
//     data,
//     error,
//     isLoading,
//     isError,
//     hasNextPage,
//     fetchNextPage,

//     isFetchingNextPage,
//     isRefetching,
//   } = trpc.getIdeas.useInfiniteQuery(
//     { search },
//     {
//       getNextPageParam: (lastPage) => lastPage.nextCursor,
//     }
//   );

//   return (
//     <div title="Форум">
//       <div className={css.filter}>
//         <Input label="Поиск" name="search" formik={formik} />
//       </div>
//       {isLoading || isRefetching ? (
//         <Loader type="section" />
//       ) : isError ? (
//         <Alert color="red">{error.message}</Alert>
//       ) : !data?.pages[0]?.ideas.length ? (
//         <Alert color="brown">Ничего не найдено</Alert>
//       ) : (
//         <div className={css.ideas}>
//           <InfiniteScroll
//             threshold={250}
//             loadMore={() => {
//               if (!isFetchingNextPage && hasNextPage) {
//                 void fetchNextPage();
//               }
//             }}
//             hasMore={hasNextPage}
//             loader={
//               <div className={css.more} key="loader">
//                 <Loader type="section" />
//               </div>
//             }
//             getScrollParent={() => layoutContentElRef.current}
//             useWindow={
//               (layoutContentElRef.current &&
//                 getComputedStyle(layoutContentElRef.current).overflow) !==
//               "auto"
//             }
//           >
//             {data.pages
//               .flatMap((page) => page.ideas)
//               .map((idea) => (
//                 <div className={css.idea} key={idea.nick}>
//                   <Segment size={2}>
//                     {/* 1. Автор */}
//                     <div className={css.author}>
//                       <img
//                         className={css.avatar}
//                         src={getAvatarUrl(idea.author?.avatar, "small")}
//                         alt="avatar"
//                       />
//                       <div className={css.name}>
//                         {idea.author?.nick ?? "Unknown"}
//                         {idea.author?.name && <span> @{idea.author.name}</span>}
//                         {idea.author?.specialty && (
//                           <span> ({idea.author.specialty})</span>
//                         )}
//                       </div>
//                     </div>

//                     {/* 2. Информация об идее */}
//                     <div className={css.ideaContent}>
//                       <Link
//                         className={css.ideaLink}
//                         to={getViewIdeaRoute({ someNick: idea.nick })}
//                       >
//                         {idea.name}
//                       </Link>

//                       {/* Добавьте этот блок для отображения полного текста идеи */}
//                       {idea.text && (
//                         <div className={css.ideaText}>{idea.text}</div>
//                       )}
//                     </div>

//                     {/* 3. Лайки */}
//                     <div className={css.likes}>
//                       <Icon
//                         size={20}
//                         className={${css.likeIcon} ${css.likeIconFilled} transition-transform duration-300 active:scale-90}
//                         name="likeFilled"
//                         onClick={() => {
//                           trpc.setIdeaLike.mutateAsync({
//                             ideaId: idea.id,
//                             isLikedByMe: !idea.isLikedByMe,
//                           });
//                         }}
//                         role="button"
//                         aria-label="Лайк"
//                         tabIndex={0}
//                       />
//                       <span className={css.likeCount}>
//                         {idea.likesCount} {getLikeWord(idea.likesCount)}
//                       </span>
//                     </div>
//                   </Segment>
//                 </div>
//               ))}
//           </InfiniteScroll>
//         </div>
//       )}
//     </div>
//   );
// });

import { useState } from "react";
import { getViewIdeaRoute, getUserProfileRoute } from "../../../lib/routes";
import { trpc } from "../../../lib/trpc";
import { Segment } from "../../../components/Segment";
import { Link } from "react-router-dom";
import css from "./index.module.scss";
import { Alert } from "../../../components/Alert";
import InfiniteScroll from "react-infinite-scroller";
import { layoutContentElRef } from "../../../components/Layout";
import { Loader } from "../../../components/Loader";
import { useDebounce } from "usehooks-ts";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { getAvatarUrl } from "@forum_project/shared/src/cloudinary";
import { Heart } from "lucide-react";
import { Input } from "../../../components/Input";
import { useForm } from "../../../lib/form";
import { zGetIdeasTrpcInput } from "@forum_project/backend/src/router/ideas/getIdeas/input";
import cn from "classnames";

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

export const AllIdeasPage = withPageWrapper({
  title: "Beauty and Health",
  isTitleExact: true,
})(() => {
  const { formik } = useForm({
    initialValues: { search: "" },
    validationSchema: zGetIdeasTrpcInput.pick({ search: true }),
  });

  const [expandedIdeas, setExpandedIdeas] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (ideaId: string) => {
    setExpandedIdeas((prev) => ({
      ...prev,
      [ideaId]: !prev[ideaId],
    }));
  };

  const search = useDebounce(formik.values.search, 500);
  const utils = trpc.useUtils();

  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = trpc.getIdeas.useInfiniteQuery(
    { search },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const { mutateAsync: setLike } = trpc.setIdeaLike.useMutation({
    onSuccess: () => {
      utils.getIdeas.invalidate();
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
      <div className={css.filter}>
        <Input label="Поиск" name="search" formik={formik} />
      </div>

      {isLoading || isRefetching ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : !data?.pages[0]?.ideas.length ? (
        <Alert color="brown">Ничего не найдено</Alert>
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
                <div className={css.idea} key={idea.id}>
                  <Segment size={2}>
                    {/* Автор */}
                    <div className={css.author}>
                      <img
                        className={css.avatar}
                        src={
                          getAvatarUrl(idea.author.avatar, "small") || avatar
                        }
                        alt="avatar"
                      />
                      <div className={css.authorInfo}>
                        <div className={css.name}>
                          {idea.author?.nick ?? "Неизвестный автор"}
                        </div>
                        <div className={css.meta}>
                          {idea.author?.name && (
                            <span>@{idea.author.name}</span>
                          )}
                          {idea.author?.specialty && (
                            <span> • {idea.author.specialty}</span>
                          )}
                        </div>
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

                      {idea.text && (
                        <div className={css.textContainer}>
                          <div
                            className={cn(css.ideaText, {
                              [css.expanded]: expandedIdeas[idea.id],
                            })}
                          >
                            {idea.text}
                          </div>
                          {idea.text.length > 200 && (
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