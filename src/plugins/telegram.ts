import fp from 'fastify-plugin'

import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { FastifyPluginAsync } from 'fastify'
import { Client } from '@telegraf/client'
import { Type } from '@sinclair/typebox'

import { PipelineContext, PipelineOutput } from '../pipeline/pipeline'

export interface TelegramPluginOptions {
  botToken: string
  routePath: string
  pipelineHandler: (input: PipelineContext) => Promise<PipelineOutput>
}

const telegramPlugin: FastifyPluginAsync<TelegramPluginOptions> = async (fastify, options) => {
  const tgClient = new Client(options.botToken)

  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    options.routePath,
    {
      schema: {
        body: Type.Object({
          message: Type.Object({
            from: Type.Object({
              id: Type.Integer(),
            }),
            text: Type.String(),
          }),
        }),
      },
    },
    async (request, reply) => {
      const ctx = {
        interface: 'telegram',
        from: request.body.message.from.id,
        message: request.body.message.text,
      }

      const pipelineOutput = await options.pipelineHandler(ctx)

      // TODO: extract out to adapter implmenting abstract class
      await tgClient.call('sendMessage', {
        chat_id: request.body.message.from.id,
        text: pipelineOutput.message,
      })

      reply.status(200).send()
    },
  )
}

export default fp(telegramPlugin, '4.x')
