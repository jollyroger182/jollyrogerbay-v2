import type {
  RespondArguments,
  SlackCommandMiddlewareArgs,
} from '@slack/bolt'
import { getUser } from '../utils/cache'
import { getUserIdFromMention } from '../utils'

export default async function (
  { ack, payload, respond }: SlackCommandMiddlewareArgs,
  text: string,
) {
  ack()

  text = text.replace('<!channel>', '@channel').replace('<!here>', '@here')

  const message: RespondArguments = {
    text,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text } }],
    response_type: 'in_channel'
  }

  const parts = text.split(' ')
  let i: number
  for (i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (!part.startsWith('-') || !part.includes('=')) break
    const [key, value] = part.substring(1).split('=')
    if (key === 'pfp') {
      const id = getUserIdFromMention(value!)
      const user = await getUser(id)
      message.icon_url = user.profile?.image_original
    } else if (key === 'name') {
      message.username = value
    }
  }

  const newText = parts.slice(i).join(' ')
  message.text = newText
  message.blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: newText } },
  ]

  console.log(JSON.stringify(message, null, 2))

  await respond({ ...message })
}
