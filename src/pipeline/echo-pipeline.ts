import { PipelineContext, InterfaceContext } from '../lib/context'

export default async function echoPipelineHandler(ctx: InterfaceContext): Promise<PipelineContext> {
  return Object.assign(ctx, {
    continueSession: true,
    outgoingUserReply: ctx.incomingUserResponse,
  })
}
