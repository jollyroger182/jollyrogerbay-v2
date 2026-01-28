import type z from 'zod'

export function defineModule<T>(
  func: (config: T) => Promise<void>,
  schema: z.ZodType<T>,
) {
  return { func, schema }
}

export function maybePing(userId: string) {
  return userId === process.env.SLACK_OWNER ? 'jolly' : `<@${userId}>`
}

export function getUserIdFromMention(mention: string) {
  const match = mention.match(/^<@([A-Z0-9]+)(?:\|.*)?>$/)
  if (match) {
    return match[1]!
  }
  return mention
}
