
import { getNewIdeaRoute, getViewIdeaRoute } from '@forum_project/webapp/src/lib/routes'
import { type Idea, type User } from '@prisma/client'
import { sendEmail } from './utils'

export const sendWelcomeEmail = async ({ user }: { user: Pick<User, 'nick' | 'email'> }) => {
  return await sendEmail({
    to: user.email,
    subject: 'Thanks For Registration!',
    templateName: 'welcome',
    templateVariables: {
      userNick: user.nick,
      addIdeaUrl: `${getNewIdeaRoute({ abs: true })}`,
    },
  })
}

export const sendIdeaBlockedEmail = async ({ user, idea }: { user: Pick<User, 'email'>; idea: Pick<Idea, 'nick'> }) => {
  return await sendEmail({
    to: user.email,
    subject: 'Ваше обсуждение заблокировано',
    templateName: 'ideaBlocked',
    templateVariables: {
      someNick: idea.nick,
    },
  })
}