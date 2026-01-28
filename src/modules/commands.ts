// "fake" slash commands

import z from 'zod'
import { app } from '../clients'
import commands from '../commands'
import { defineModule } from '../utils'

const ConfigSchema = z.object({
  permissions: z
    .object({
      default: z.array(z.string()).default([process.env.SLACK_OWNER]),
    })
    .catchall(z.array(z.string()))
    .default({ default: [process.env.SLACK_OWNER] }),
  commands: z.object().catchall(z.boolean()).default({}),
})

export default defineModule(async function (config) {
  console.debug('setting up commands with config', config)

  app.event('app_mention', async ({ payload }) => {
    if (payload.subtype || !payload.user) return

    const parts = (payload.text || '').trim().split(' ')
    let command = parts[1]
    if (!command || !command.startsWith('/')) return
    command = command.substring(1)
    console.debug(
      'command',
      command,
      'executed by',
      payload.user,
      'in',
      payload.channel,
      '-',
      payload.text,
    )

    if (!(config.commands?.[command] ?? true)) return
    const allowed = config.permissions?.[command] || config.permissions.default
    if (!allowed.includes(payload.user)) return

    const func = commands[command as keyof typeof commands]
    await func(payload, parts.slice(2).join(' '))
  })
}, ConfigSchema)
