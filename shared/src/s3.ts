// eslint-disable-next-line node/no-process-env
const s3Url = process.env.VITE_S3_URL || process.env.S3_URL;

export const getS3UploadName = (path: string) => {
  const filename = path.replace(/^.*[\\/]/, ''); // Убираем путь, оставляем имя файла
  const parts = filename.split('-');
  parts.shift(); // Убираем первый элемент (предположительно какой-то префикс)
  return parts.join('-');
}

export const getS3UploadUrl = (s3Key: string) => {
  const url = `${s3Url}/${s3Key}`;
  
  // Логируем сгенерированный URL
  console.log('Generated S3 URL:', url); // Добавил логирование

  return url;
}
