import { app } from './clients'
import modules from './modules'

console.debug('loading config file')
const configFile = Bun.file(process.env.CONFIG_FILE || 'config.yaml')
const config: any = (await configFile.exists())
  ? Bun.YAML.parse(await configFile.text())
  : {}
console.debug('config loaded:', config)

for (const [name, module] of Object.entries(modules)) {
  const moduleConfig = config[name]
  if (moduleConfig?.disable) continue
  console.debug('setting up module', name)
  await module(app, moduleConfig)
}

await app.start()

console.log('jollyrogerbay has started at', new Date(), ':3')
