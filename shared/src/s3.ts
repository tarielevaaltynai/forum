import { sharedEnv } from './env'

export const getS3UploadName = (path: string) => {
  const filename = path.replace(/^.*[\\/]/, ''); // Убираем путь, оставляем имя файла
  const parts = filename.split('-');
  parts.shift(); // Убираем первый элемент (предположительно какой-то префикс)
  return parts.join('-');
}

export const getS3UploadUrl = (s3Key: string) => {
    return `${sharedEnv.S3_URL}/${s3Key}`

  
  // Логируем сгенерированный URL
  console.log('Generated S3 URL:', url); // Добавил логирование

  return url;
}
