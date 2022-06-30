import fp from 'fastify-plugin'

import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { FastifyPluginAsync } from 'fastify'
import { Client } from '@telegraf/client'
import { Type } from '@sinclair/typebox'

import { PipelineContext, InterfaceContext } from '../../lib/context'

export interface TelegramPluginOptions {
  botToken: string
  routePath: string
  pipelineHandler: (input: InterfaceContext) => Promise<PipelineContext>
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
      const requestCtx: InterfaceContext = {
        interface: 'telegram',
        from: request.body.message.from.id,
        incomingUserResponse: request.body.message.text,
      }

      try {
        const pipelineOutput = await options.pipelineHandler(requestCtx)
        await tgClient.call('sendMessage', {
          chat_id: requestCtx.from,
          text: pipelineOutput.outgoingUserReply,
        })

        reply.status(200).send()
      } catch (error) {
        reply.status(500).send()
      }
    },
  )
}

export default fp(telegramPlugin, '4.x')
