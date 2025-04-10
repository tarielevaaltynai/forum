// webapp/src/components/userLink/index.tsx
import { FC } from 'react';
import { Link } from 'react-router-dom'; // ← Заменяем next/link
import defaultAvatar from '../../assets/images/user.png';
import styles from './index.module.scss';

type UserLinkProps = {
  userId: string;
  nick: string;
  name?: string;
  avatar?: string | null;
  className?: string;
  showAvatar?: boolean;
  isAdminAction?: boolean;
};

const UserLink: FC<UserLinkProps> = ({
  userId,
  nick,
  name,
  avatar = null,
  className = '',
  showAvatar = false,
  isAdminAction = false
}) => {
  const displayName = name || nick;

  return (
    <Link 
      to={`/users/${userId}`} // ← Заменяем href на to
      className={`${styles.userLink} ${className} ${isAdminAction ? styles.adminAction : ''}`}
    >
      {showAvatar && (
        <div className={styles.avatarContainer}>
          <img // ← Заменяем next/image на обычный img
            src={avatar || defaultAvatar} 
            alt={displayName} 
            className={styles.avatar}
          />
        </div>
      )}
      <span className={styles.userName}>{displayName}</span>
      {isAdminAction && <span className={styles.adminBadge}>Админ</span>}
    </Link>
  );
};

export default UserLink;