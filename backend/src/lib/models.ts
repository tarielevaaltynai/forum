import { type User } from '@prisma/client'
import _ from 'lodash'
import { pick } from '@forum_project/shared/src/pick'
export const toClientMe = (user: User | null) => {
  return user && pick(user, ['id', 'nick', 'name','surname','gender','birthDate','permissions'])
}

