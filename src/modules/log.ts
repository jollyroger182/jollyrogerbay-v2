import z from 'zod'
import { defineModule } from '../utils'
import { app } from '../clients'

const LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR'] as const

const ConfigSchema = z.object({
  channel: z.string().default(process.env.SLACK_OWNER),
  level: z
    .enum(LEVELS)
    .default('INFO')
    .transform((level) => LEVELS.indexOf(level)),
})

let loggingConfig: z.infer<typeof ConfigSchema> | null = null

export default defineModule(async (config) => {
  loggingConfig = config
}, ConfigSchema)

async function sendLog(text: string, level: number) {
  if (!loggingConfig || loggingConfig.level > level) return
  await app.client.chat.postMessage({
    channel: loggingConfig.channel,
    text: `\`[${LEVELS[level]!.charAt(0)}]\` ${text}`,
  })
}

function makeLogFunction(level: number) {
  return (text: string) => sendLog(text, level)
}

export const LOG = {
  debug: makeLogFunction(0),
  info: makeLogFunction(1),
  warning: makeLogFunction(2),
  error: makeLogFunction(3),
  log: sendLog
}
