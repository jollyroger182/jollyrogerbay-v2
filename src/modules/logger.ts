import z from 'zod'
import { defineModule } from '../utils'
import { app } from '../clients'

const ConfigSchema = z.object({
  events: z.array(z.string()).default([]),
  message_subtypes: z.array(z.union([z.null(), z.string()])).default([]),
})

export default defineModule(async function (
  config = { events: [], message_subtypes: [] },
) {
  const { events, message_subtypes: subtypes } = config

  for (const event of events) {
    app.event(event, async ({ body, payload }) => {
      console.log(body.event.type, 'event received:', JSON.stringify(payload))
    })
  }
  if (subtypes.length) {
    app.event('message', async ({body, payload}) => {
      if (!subtypes.includes(payload.subtype || null)) return
      console.log(`message.${payload.subtype} received:`, JSON.stringify(payload))
    })
  }
}, ConfigSchema)
