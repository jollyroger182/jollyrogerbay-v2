import z from 'zod'
import { defineModule, maybePing } from '../utils'
import { KV } from '../storage/kv'
import { app } from '../clients'
import { LOG } from './log'

const { STEAM_API_KEY } = process.env

const ConfigSchema = z.object({
  users: z.array(
    z.object({
      id: z.string(),
      user: z.string(),
      channel: z.string(),
    }),
  ),
})

let cfg: z.infer<typeof ConfigSchema> | null = null

export default defineModule(async (config) => {
  cfg = config
  setInterval(checkSteam, 60_000)
  checkSteam()
}, ConfigSchema)

async function checkSteam() {
  if (!cfg) return

  LOG.debug('checking steam updates')

  const userMap = new Map<string, { user: string; channel: string }>()
  for (const user of cfg.users) {
    userMap.set(user.id, user)
  }

  try {
    const res = (await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${userMap.keys().toArray().join(',')}`,
    ).then((r) => r.json())) as any

    for (const player of res?.response?.players ?? []) {
      const id = player.steamid
      if (!userMap.has(id)) continue
      const { user, channel } = userMap.get(id)!

      const prevGame = await KV.get(`steam.game.${user}`)
      const currentGame = player.gameid || null
      LOG.debug(
        `fetched steam game for ${user}, old: \`${prevGame}\`, new: \`${currentGame}\``,
      )
      if (prevGame !== currentGame) {
        let text = ''
        if (currentGame) {
          const gameName = player.gameextrainfo || 'Unknown game'
          text = `${maybePing(user)} is now playing: <https://store.steampowered.com/app/${currentGame}/|${gameName}>!`
        } else {
          text = `${maybePing(user)}} stopped playing games!`
        }
        await Promise.all([
          app.client.chat.postMessage({ channel, text }),
          currentGame
            ? KV.set(`steam.game.${user}`, currentGame)
            : KV.delete(`steam.game.${user}`),
        ])
      }
    }
  } catch (e) {
    console.error('error checking steam game', e)
    LOG.error(`error checking steam game\n\n\`\`\`\n${e}\n\`\`\``)
  }
}
