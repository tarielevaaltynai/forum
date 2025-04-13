import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "../../lib/trpc";
import styles from "./index.module.scss";
import { Spinner } from "../../components/Spinner";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { UserLink } from "../../components/UserLink";
import { Segment } from "../../components/Segment";
import { Icon } from "../../components/Icon";
import { withPageWrapper } from "../../lib/pageWrapper";
import type { TrpcRouterOutput } from "@forum_project/backend/src/router";
import { format } from "date-fns";
import defaultAvatar from "../../assets/images/user.png";

export const UserProfilePage = withPageWrapper({
  setProps: ({ ctx }) => ({
    me: ctx.me,
  }),
  title: ({ user }) => `${user?.name || 'Профиль'} ${user?.surname || ''}`,
})(({ me }) => {
  const { id: userId = "" } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const {
    data: userData,
    isLoading: isLoadingUser,
    error,
    refetch: refetchUser,
  } = trpc.getUserProfile.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const blockUserMutation = trpc.blockUser.useMutation({
    onSuccess: () => {
      refetchUser();
    },
  });

  useEffect(() => {
    if (me?.id && userId && me.id === userId) {
      navigate("/me");
    }
  }, [me?.id, userId, navigate]);

  const handleToggleBlock = () => {
    if (userData?.user && userId) {
      blockUserMutation.mutate({
        userId,
        blocked: !userData.user.blocked,
      });
    }
  };

  if (isLoadingUser) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert color="red">{error.message}</Alert>
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className={styles.container}>
        <Alert color="brown">Пользователь не найден</Alert>
      </div>
    );
  }

  const user = userData.user;

  const canBlockUsers = me?.permissions?.some(
    (perm) => perm === "ALL" || perm === "BLOCK_USERS"
  );

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <img
            src={
              user.avatar && user.avatar.startsWith("http")
                ? user.avatar
                : defaultAvatar
            }
            alt={`${user.name} ${user.surname}`}
            className={styles.avatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatar;
            }}
          />
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>
            {user.name} {user.surname}
            {user.verified && (
              <Icon name="verified" className={styles.verifiedIcon} />
            )}
          </h1>

          <UserLink
            userId={user.id}
            nick={user.nick}
            className={styles.userNick}
            prefix="@"
          />

          {user.blocked && (
            <Alert color="red" className={styles.blockedAlert}>
              Пользователь заблокирован
              {user.blockedAt &&
                ` (${format(new Date(user.blockedAt), "dd.MM.yyyy")})`}
            </Alert>
          )}
        </div>

        {canBlockUsers && me?.id !== user.id && (
          <Button
            onClick={handleToggleBlock}
            color={user.blocked ? "green" : "red"}
            className={styles.blockButton}
            loading={blockUserMutation.isLoading}
          >
            {user.blocked ? "Разблокировать" : "Заблокировать"}
          </Button>
        )}
      </div>

      <div className={styles.profileDetails}>
        <Segment title="Основная информация">
          <div className={styles.detailItem}>
            <Icon name="gender" />
            <span>
              {user.gender === "male"
                ? "Мужской"
                : user.gender === "female"
                ? "Женский"
                : "Не указан"}
            </span>
          </div>
          <div className={styles.detailItem}>
            <Icon name="calendar" />
            <span>
              {user.birthDate
                ? format(new Date(user.birthDate), "dd.MM.yyyy")
                : "Не указана"}
            </span>
          </div>
          <div className={styles.detailItem}>
            <Icon name="clock" />
            <span>
              Зарегистрирован:{" "}
              {user.createdAt
                ? format(new Date(user.createdAt), "dd.MM.yyyy")
                : "Неизвестно"}
            </span>
          </div>
        </Segment>

        <Segment title="Активность">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user._count?.ideas ?? 0}</div>
              <div className={styles.statLabel}>Идей</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user._count?.comments ?? 0}</div>
              <div className={styles.statLabel}>Комментариев</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {user._count?.ideasLikes ?? 0}
              </div>
              <div className={styles.statLabel}>Лайков</div>
            </div>
          </div>
        </Segment>

        <Segment title="Последние идеи">
          {user._count?.ideas ? (
            <div className={styles.ideasList}>
              <Alert color="brown">Функционал списка идей в разработке</Alert>
            </div>
          ) : (
            <Alert color="brown">Пользователь еще не публиковал идеи</Alert>
          )}
        </Segment>
      </div>
    </div>
  );
});
