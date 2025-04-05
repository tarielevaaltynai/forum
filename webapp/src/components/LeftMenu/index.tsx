
import { Link } from 'react-router-dom';
import { getAllIdeasRoute, getNewIdeaRoute, getEditProfileRoute, getSignOutRoute, getMyIdeasRoute } from '../../lib/routes';
import { useMe } from '../../lib/ctx'; // Импорт контекста
import css from './index.module.scss';
import avatar from '../../assets/images/user.png'; // Это можно оставить как запасной вариант
import { getAvatarUrl } from '@forum_project/shared/src/cloudinary'; // Для получения URL аватара
import '@fortawesome/fontawesome-free/css/all.min.css';


export const LeftMenu = () => {
  const me = useMe(); // Получение данных о пользователе из контекста

  if (!me) {
    return null; // Возвращаем null, если нет данных о пользователе
  }

  // Определяем, какой URL использовать для аватарки
  // Если me.avatar существует и не пустой, используем его, иначе - дефолтный
  const avatarSrc = me.avatar || defaultAvatar;

  return (
    <div className={css.sidebar}>
      <div className={css.profile}>
        <img
          alt="Profile picture"
          // Убедитесь, что классы стилей подходят для реальных аватарок
          // Возможно, 'rounded-full mx-auto' уже достаточно
          className="rounded-full mx-auto" // Можно добавить css.avatar если нужно
          height="100"

          src={getAvatarUrl(me.avatar, 'small') || avatar} // Здесь мы получаем URL аватара пользователя

          width="100"
          // Добавляем обработчик ошибок на случай, если URL аватарки станет недействительным
          onError={(e) => {
            const target = e.target as HTMLImageElement; // Указываем тип для TypeScript
            target.onerror = null; // Предотвращаем бесконечный цикл ошибок
            target.src = defaultAvatar; // Показываем дефолтную при ошибке
          }}
        />
        <h2>{me.nick}</h2>
      </div>

      <nav>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getAllIdeasRoute()}>
              <i className="fas fa-home mr-2"></i>
              Главная страница
            </Link>
          </li>
          <li className={css.item}>
            <Link className={css.link} to={getNewIdeaRoute()}>
              <i className="fas fa-plus-circle mr-2"></i>
              Создать обсуждение
            </Link>
          </li>
          
          <li className={css.item}>
            <Link to={getMyIdeasRoute()}>
              <i className="fas fa-sign-out-alt mr-2"></i>
              Мои обсуждения
            </Link>
          </li>
          <li className={css.item}>
            <Link className={css.link} to={getEditProfileRoute()}>
              <i className="fas fa-user-edit mr-2"></i>
              Профиль
            </Link>
          </li>
          <li className={css.item}>
            <Link to={getSignOutRoute()}>
              <i className="fas fa-sign-out-alt mr-2"></i>
              Выйти({me.nick})
            </Link>
          </li>

        </ul>
      </nav>
    </div>
  );
};
