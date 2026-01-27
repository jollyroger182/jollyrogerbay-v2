import { app } from './clients'
import modules from './modules'

console.debug('loading config file')
const configFile = Bun.file(process.env.CONFIG_FILE || 'config.yaml')
const config: any = (await configFile.exists())
  ? Bun.YAML.parse(await configFile.text())
  : {}
console.debug('config loaded:', config)

for (const [name, { func, schema }] of Object.entries(modules)) {
  const moduleConfig = config[name] ?? {}
  if (moduleConfig === false) continue
  console.debug('setting up module', name)
  try {
    const config = schema.parse(moduleConfig)
    await func(config as any)
  } catch (e) {
    console.error('failed to set up module', name, e)
  }
}

await app.start()

console.log('jollyrogerbay has started at', new Date(), ':3')
