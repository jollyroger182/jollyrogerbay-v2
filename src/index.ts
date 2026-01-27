import { App } from "@slack/bolt"

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true
})

await app.start()

console.log('jollyrogerbay has started at', new Date(), ':3')
