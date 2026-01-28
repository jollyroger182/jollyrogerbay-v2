import { app } from '../clients'
import type { User } from '@slack/web-api/dist/types/response/UsersInfoResponse'

interface CachedUser {
  time: number
  user: User
}

const userCache = new Map<string, CachedUser>()

export async function getUser(user: string, freshness: number = 60_000) {
  const cached = userCache.get(user)
  if (!cached || cached.time < Date.now() - freshness) {
    const res = await app.client.users.info({ user })
    userCache.set(user, { time: Date.now(), user: res.user! })
    return res.user!
  }
  return cached.user
}
