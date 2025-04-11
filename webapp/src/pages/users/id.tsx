import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "../../lib/trpc";
import styles from "./index.module.scss";

import defaultAvatar from "../../assets/images/user.png";
import { Spinner } from "../../components/Spinner";
import { Alert } from "../../components/Alert";
import cn from 'classnames';

export default function UserProfilePage() {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: meData, isLoading: isLoadingMe } = trpc.getMe.useQuery();

  const {
    data: userData,
    isLoading: isLoadingUser,
    error,
    refetch: refetchUser
  } = trpc.getUserProfile.useQuery(
    { userId: userId || '' },
    { enabled: !!userId }
  );

  const blockUserMutation = trpc.blockUser.useMutation({
    onSuccess: () => {
      refetchUser();
    }
  });

  useEffect(() => {
    if (meData?.me?.permissions) {
      const hasAdminPermission = meData.me.permissions.some(
        perm => perm === 'ALL' || perm === 'BLOCK_IDEAS'
      );
      setIsAdmin(hasAdminPermission);
    }
  }, [meData]);

  const handleToggleBlock = () => {
    if (userData?.user && userId) {
      blockUserMutation.mutate({
        userId,
        blocked: !userData.user.blocked
      });
    }
  };

  useEffect(() => {
    if (meData?.me?.id && userId && meData.me.id === userId) {
      navigate("/me");
    }
  }, [meData, userId, navigate]);

  if (isLoadingMe || isLoadingUser || !meData) {
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

  return (
    <div className={styles.container}>
      <div className={styles.profile}>
        <div className={styles.avatarContainer}>
          <img
            src={user.avatar?.startsWith("http") ? user.avatar : defaultAvatar}
            alt={`${user.name} ${user.surname}`}
            className={styles.avatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatar;
            }}
          />
        </div>
        <div className={styles.profileName}>{user.name} {user.surname}</div>
        <div className={styles.userNick}>@{user.nick}</div>

        {user.blocked && (
          <Alert color="red">
            Пользователь заблокирован
            {user.blockedAt && ` (${new Date(user.blockedAt).toLocaleDateString()})`}
          </Alert>
        )}

        {isAdmin && meData.me?.id !== user.id && (
          <button
            onClick={handleToggleBlock}
            className={cn(styles.actionButton, {
              [styles.unblockButton]: user.blocked,
              [styles.blockButton]: !user.blocked
            })}
          >
            {user.blocked ? "Разблокировать" : "Заблокировать"}
          </button>
        )}

        <div className={styles.userInfo}>
          <div>Пол: {user.gender === 'male' ? 'Мужской' : 'Женский'}</div>
          <div>Дата рождения: {new Date(user.birthDate).toLocaleDateString()}</div>
          <div>Зарегистрирован: {new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className={styles.segments}>
        <div className={styles.segment}>
          <h2>Активность пользователя</h2>
          <div className={styles.activityStats}>
            <div><strong>Идей опубликовано:</strong> {user._count?.ideas || 0}</div>
            <div><strong>Комментариев оставлено:</strong> {user._count?.comments || 0}</div>
            <div><strong>Лайков поставлено:</strong> {user._count?.ideasLikes || 0}</div>
          </div>
        </div>

        <div className={styles.segment}>
          <h2>Публикации пользователя</h2>
          {user._count?.ideas ? (
            <div className={styles.ideasList}>
              <p>Список идей пользователя</p>
            </div>
          ) : (
            <Alert color="brown">Пользователь еще не публиковал идеи</Alert>
          )}
        </div>
      </div>
    </div>
  );
}
