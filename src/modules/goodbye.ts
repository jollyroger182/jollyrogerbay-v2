import z from 'zod'
import { defineModule } from '../utils'
import { app } from '../clients'

const ConfigSchema = z.object({
  channels: z.array(z.string()),
  notify_channel: z.string().default(process.env.SLACK_OWNER),
})

export default defineModule(async (config) => {
  app.event('member_left_channel', async ({ payload }) => {
    if (!config.channels.includes(payload.channel)) return
    await app.client.chat.postMessage({
      channel: config.notify_channel,
      text: `<@${payload.user}> just left <#${payload.channel}>.`,
    })
  })
}, ConfigSchema)
