import { ErrorPageComponent } from '../../../components/ErrorPageComponent'

export const NotFoundPage = ({
  title = 'Не найдено',
  message = 'Эта страница не существует',
}: {
  title?: string
  message?: string
}) => <ErrorPageComponent title={title} message={message} />