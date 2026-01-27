import type { AppMentionEvent } from '@slack/types'
import { app } from '../clients'

export default async function (event: AppMentionEvent, text: string) {
  await app.client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.thread_ts,
    text: text,
  })
}
