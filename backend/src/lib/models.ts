
import { type User } from "@prisma/client";
import _ from "lodash";
import { pick } from "@forum_project/shared/src/pick";
import { getCloudinaryUploadUrl } from "@forum_project/shared/src/cloudinary";
export const toClientMe = (user: User | null) => {
  if (!user) return null;

  const baseData = pick(user, [
    "id",
    "nick",
    "name",
    "surname",
    "gender",
    "birthDate",
    "permissions",
    "avatar", // Оригинальный public_id из Cloudinary
  ]);

  // Добавляем URL аватара с преобразованиями
  return {
    ...baseData,
    avatarUrl: user.avatar
      ? getCloudinaryUploadUrl(user.avatar, "avatar", "big")
      : null,
  };
};

// Тип для клиентского представления пользователя
export type ClientMe = ReturnType<typeof toClientMe>;  // создали свои пик и омит

// Хелпер для проверки аватара
export const hasAvatar = (
  user: ClientMe | null
): user is ClientMe & { avatarUrl: string } => {
  return !!user?.avatarUrl;
};









// | Что делает       | Зачем                                              |
// | ---------------- | -------------------------------------------------- |
// | `toClientMe`     | Преобразует `User` из базы в безопасный формат     |
// | `avatarUrl`      | Формирует удобную ссылку на изображение            |
// | `pick(...)`      | Убирает лишние/опасные поля (например, `password`) |
// | `hasAvatar(...)` | Помогает TypeScript понять, что поле точно есть    |
// | `ClientMe`       | Создаёт строго типизированный объект для фронтенда |
