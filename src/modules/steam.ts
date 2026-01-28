import z from 'zod'
import { defineModule } from '../utils'
import { KV } from '../storage/kv'
import { app } from '../clients'
import { LOG } from './log'

const { STEAM_API_KEY, STEAM_USER_ID } = process.env

const ConfigSchema = z.object({
  channel: z.string(),
})

let cfg: z.infer<typeof ConfigSchema> | null = null

export default defineModule(async (config) => {
  cfg = config
  setInterval(checkSteam, 60_000)
  checkSteam()
}, ConfigSchema)

async function checkSteam() {
  if (!cfg) return

  LOG.debug('checking steam game')

  try {
    const res = (await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${STEAM_USER_ID}`,
    ).then((r) => r.json())) as any
    const player = res?.response?.players?.[0]
    if (!player) {
      throw new Error(`Failed to get Steam player: ${JSON.stringify(res)}`)
    }

    const prevGame = await KV.get('steam.game')
    const currentGame = player.gameid || null
    LOG.debug(`fetched steam game, old: \`${prevGame}\`, new: \`${currentGame}\``)
    if (prevGame !== currentGame) {
      let text = ''
      if (currentGame) {
        const gameName = player.gameextrainfo || 'Unknown game'
        text = `jolly is now playing: <https://store.steampowered.com/app/${currentGame}/|${gameName}>!`
      } else {
        text = `jolly stopped playing games!`
      }
      await Promise.all([
        app.client.chat.postMessage({
          channel: cfg.channel,
          text,
        }),
        currentGame
          ? KV.set('steam.game', currentGame)
          : KV.delete('steam.game'),
      ])
    }
  } catch (e) {
    console.error('error checking steam game', e)
    LOG.error(`error checking steam game\n\n\`\`\`\n${e}\n\`\`\``)
  }
}
