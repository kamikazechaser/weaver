import { resolve } from 'path'

import { ajvTypeBoxPlugin, TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Config } from 'confini'
import Fastify from 'fastify'

import echoPipelineHandler from './pipeline/echo-pipeline'
import telegramPlugin from './plugins/telegram'

const app = Fastify({
  ajv: {
    plugins: [ajvTypeBoxPlugin],
  },
  logger: {
    base: null,
  },
}).withTypeProvider<TypeBoxTypeProvider>()

async function startServer() {
  const c = new Config(resolve(__dirname, '..') + '/config')
  c.process()

  app.register(telegramPlugin, {
    botToken: c.get('TELEGRAM_BOT_TOKEN'),
    routePath: c.get('TELEGRAM_ROUTE_PATH'),
    pipelineHandler: echoPipelineHandler,
  })

  await app.ready()
  await app.listen({ port: c.get('SERVER_PORT') })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await app.close()
      return process.exit(0)
    })
  }
}

startServer()
