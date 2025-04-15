import { useParams } from "react-router-dom";
import { trpc } from "../../lib/trpc";
import { Loader } from "../../components/Loader";
import { Alert } from "../../components/Alert";
import styles from "./index.module.scss";
import avatarPlaceholder from "../../assets/images/user.png";

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = trpc.getUserById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  if (isLoading) return <Loader type="page" />; // Добавлен пропс type
  if (error) return <Alert color="red">{error.message}</Alert>;

  const user = data?.user;

  if (!user) {
    return <Alert color="red">Пользователь не найден</Alert>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <img
          className={styles.avatar}
          src={user.avatarUrl ?? avatarPlaceholder}
          alt="Аватар"
        />
        <div className={styles.info}>
          <h2>
            {user.name} {user.surname}
          </h2>
          <p>Ник: {user.nick}</p>
          <p>Пол: {user.gender}</p>
          <p>
            Дата рождения:{" "}
            {user.birthDate
              ? new Date(user.birthDate).toLocaleDateString()
              : "Не указана"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;