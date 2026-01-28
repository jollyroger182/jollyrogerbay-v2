import z from 'zod'
import { defineModule, maybePing } from '../utils'
import { app } from '../clients'
import slash from '../slash'
import { LOG } from './log'

const ConfigSchema = z.object({
  permissions: z
    .object({
      default: z.array(z.string()).default([process.env.SLACK_OWNER]),
    })
    .catchall(z.array(z.string()))
    .default({ default: [process.env.SLACK_OWNER] }),
  subcommands: z.object().catchall(z.boolean()).default({}),
})

export default defineModule(async (config) => {
  app.command(/\/.*jrb/, async (event) => {
    const parts = event.payload.text.split(' ')
    const subcommand = parts[0]
    if (!subcommand) {
      return event.ack('no subcommand provided')
    }
    LOG.info(
      `slash command executed by ${maybePing(event.payload.user_id)} in <#${event.payload.channel_id}>\n\`\`\`\n${event.payload.command} ${event.payload.text}\n\`\`\``,
    )

    if (!(config.subcommands?.[subcommand] ?? true)) {
      return event.ack('unknown subcommand')
    }
    const allowed =
      config.permissions?.[subcommand] || config.permissions.default
    if (!allowed.includes(event.payload.user_id)) {
      return event.ack('unknown subcommand')
    }

    const func = slash[subcommand as keyof typeof slash]
    await func(event, parts.slice(1).join(' '))
  })
}, ConfigSchema)
