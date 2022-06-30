export interface InterfaceContext {
  interface: 'telegram' | 'at'
  from: string | number
  incomingUserResponse: string
}

export interface PipelineContext extends InterfaceContext {
  continueSession: boolean
  outgoingUserReply: string
}
