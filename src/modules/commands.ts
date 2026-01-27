// "fake" slash commands

import z from 'zod'
import { app } from '../clients'
import commands from '../commands'
import { defineModule } from '../utils'

const ConfigSchema = z.object().catchall(z.boolean())

export default defineModule(async function (config = {}) {
  console.debug('setting up commands with config', config)

  app.event('app_mention', async ({ payload }) => {
    if (payload.subtype) return
    if (payload.user !== process.env.SLACK_OWNER) return

    const parts = (payload.text || '').trim().split(' ')
    const command = parts[1]
    if (command && command in commands && (config?.[command] ?? true)) {
      const func = commands[command as keyof typeof commands]
      await func(payload, parts.slice(2).join(' '))
    }
  })
}, ConfigSchema)
