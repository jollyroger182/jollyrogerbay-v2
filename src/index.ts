import { app } from './clients'
import modules from './modules'

for (const module of modules) {
  await module(app)
}

await app.start()

console.log('jollyrogerbay has started at', new Date(), ':3')
