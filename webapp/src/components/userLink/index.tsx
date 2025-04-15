// webapp/src/components/UserLink/index.tsx
import { Link } from 'react-router-dom';
import styles from './index.module.scss';

type UserLinkProps = {
  userId: string;
  nick: string;
  name?: string;
  avatar?: string | null;
  className?: string;
  showAvatar?: boolean;
  isAdminAction?: boolean;
  showFullName?: boolean;
};

export const UserLink = ({
  userId,
  nick,
  name,
  avatar = null,
  className = '',
  showAvatar = true,
  isAdminAction = false,
  showFullName = true
}: UserLinkProps) => {
  const displayName = name || nick;

  return (
    <Link 
      to={`/users/${userId}`}
      className={`${styles.userLink} ${className} ${isAdminAction ? styles.adminAction : ''}`}
    >
      <div className={styles.linkWrapper}>
        {showAvatar && (
          <div className={styles.avatarContainer}>
            <img
              src={avatar || defaultAvatar} 
              alt={displayName}
              className={styles.avatar}
              width={32}
              height={32}
            />
          </div>
        )}
        
        <div className={styles.textContent}>
          {showFullName && name && (
            <span className={styles.fullName}>{name}</span>
          )}
          <span className={styles.nick}>@{nick}</span>
        </div>
        
        {isAdminAction && <span className={styles.adminBadge}>Админ</span>}
      </div>
    </Link>
  );
};

// Добавьте в начало файла или в отдельный файл с константами
const defaultAvatar = '/images/user.png'; // Убедитесь что файл существует в public/images