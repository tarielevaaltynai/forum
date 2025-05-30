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
import {
  getAvatarUrl,
  getCloudinaryUploadUrl,
} from "@forum_project/shared/src/cloudinary";
import { Icon } from "../../../components/Icon";
import { Input } from "../../../components/Input";
import { useForm } from "../../../lib/form";
import { zGetIdeasTrpcInput } from "@forum_project/backend/src/router/ideas/getIdeas/input";
import ImageGallery from "react-image-gallery"; // Add this import

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

  const search = useDebounce(formik.values.search, 500);

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

  return (
    <div className={css.container}>
      <h1 className={css.pageTitle}>Форум</h1>
      <Segment title="">
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
                  {/* 1. Автор - with avatar added */}
                  <div className={css.author}>
                    <img
                      className={css.avatar}
                      src={getAvatarUrl(idea.author?.avatar, "small")}
                      alt="avatar"
                    />
                    <div className={css.name}>
                      {idea.author ? (
                        <Link
                          to={`/users/${idea.author.id}`}
                          className={css.authorLink}
                        >
                          {idea.author.nick}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                      {idea.author?.name && <span> ({idea.author.name})</span>}
                      {idea.author?.specialty && (
                        <span> ({idea.author.specialty})</span>
                      )}
                    </div>
                  </div>

                  {/* 2. Информация об идее */}
                  <div className={css.ideaContent}>
                    <Link
                      className={css.ideaLink}
                      to={getViewIdeaRoute({ someNick: idea.nick })}
                    >
                      {idea.name}
                    </Link>

                    {idea.text && (
                      <div className={css.ideaText}>{idea.text}</div>
                    )}

                    {/* Modified image gallery */}
                    {idea.images && idea.images.length > 0 && (
                      <div className={css.ideaImages}>
                        <ImageGallery
                          showPlayButton={false}
                          showFullscreenButton={true}
                          showThumbnails={false}
                          showNav={true}
                          items={idea.images.map((image) => ({
                            original: getCloudinaryUploadUrl(
                              image,
                              "image",
                              "large" // Use 'large' instead of 'medium'
                            ),
                            thumbnail: getCloudinaryUploadUrl(
                              image,
                              "image",
                              "preview"
                            ),
                          }))}
                          additionalClass={css.fullWidthGallery}
                        />
                      </div>
                    )}

                    {/* 3. Лайки */}
                    <div className={css.likes}>
                      <Icon
                        size={20}
                        className={`${css.likeIcon} ${css.likeIconFilled} transition-transform duration-300 active:scale-90`}
                        name="likeFilled"
                        onClick={() => {
                          trpc.setIdeaLike.mutateAsync({
                            ideaId: idea.id,
                            isLikedByMe: !idea.isLikedByMe,
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
                  </div>
                </div>
              ))}
          </InfiniteScroll>
        )}
      </Segment>
    </div>
  );
});