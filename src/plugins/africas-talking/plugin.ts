import fp from 'fastify-plugin'

import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { FastifyPluginAsync } from 'fastify'
import { Type } from '@sinclair/typebox'

import { PipelineContext, InterfaceContext } from '../../lib/context'
import hopsParser from './hopsParser'

export interface AtPluginOptions {
  routePath: string
  pipelineHandler: (input: InterfaceContext) => Promise<PipelineContext>
}

const atPlugin: FastifyPluginAsync<AtPluginOptions> = async (fastify, options) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    options.routePath,
    {
      schema: {
        body: Type.Object({
          sessionId: Type.String(),
          serviceCode: Type.String(),
          phoneNumber: Type.String(),
          text: Type.String(),
        }),
      },
    },
    async (request, reply) => {
      const requestCtx: InterfaceContext = {
        interface: 'at',
        from: request.body.phoneNumber,
        incomingUserResponse: request.body.text,
      }
      try {
        const atText = hopsParser(request.body.text)
        fastify.log.info(atText)
        const pipelineOutput = await options.pipelineHandler(requestCtx)

        if (pipelineOutput.continueSession) {
          reply.status(200).send(`CON ${pipelineOutput.outgoingUserReply}`)
        } else {
          reply.status(200).send(`END ${pipelineOutput.outgoingUserReply}`)
        }
      } catch (error) {
        reply.status(500).send()
      }
    },
  )
}

export default fp(atPlugin, '4.x')
