<<<<<<< HEAD
import { type User } from '@prisma/client'
import _ from 'lodash'

export const toClientMe = (user: User | null) => {
  return user && _.pick(user, ['id', 'nick', 'name','surname','gender','birthDate','permissions'])
}
=======
import { type User } from "@prisma/client";
import _ from "lodash";

export const toClientMe = (user: User | null) => {
  return (
    user &&
    _.pick(user, [
      "id",
      "nick",
      "name",
      "surname",
      "gender",
      "birthDate",
      "permissions",
    ])
  );
};
>>>>>>> d7d1fffabf09f567df420b0e3df5ed632c29940c
