import { PipelineContext, PipelineOutput } from './pipeline'

export default async function echoPipelineHandler(ctx: PipelineContext): Promise<PipelineOutput> {
  return {
    message: ctx.message,
  }
}
