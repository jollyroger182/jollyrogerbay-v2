// "fake" slash commands

import type { App } from '@slack/bolt'
import commands from '../commands'

export default async function (app: App) {
  app.event('app_mention', async ({ payload }) => {
    if (payload.subtype) return
    if (payload.user !== process.env.SLACK_OWNER) return

    const parts = (payload.text || '').trim().split(' ')
    const command = parts[1]
    if (command && command in commands) {
      const func = commands[command as keyof typeof commands]
      await func(payload, parts.slice(2).join(' '))
    }
  })
}
