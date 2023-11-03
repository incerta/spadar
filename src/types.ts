/* Large Language Model name like: 'gpt-3.5-turbo' | 'gpt-4' */
export type LLMId = string & { __idFor: 'LLM' }

/* A unique identifier for a Large Language Model adapter */
export type LLMAdapterId = string & { __idFor: 'ModelAdapter' }

/* A unique identifier for a Large Image Model adapter */
export type LIMAdapterId = string & { __idFor: 'ModelAdapter' }

/* A message from/for a LLM */
export type ChatMessage = {
  role:
    | 'system' // Role that sets the behavior of the assistant
    | 'assistant' // AI model that generates conversation responses
    | 'user' // Role that provides input to the conversation
  content: string
}

export type LLMOptions = {
  // TODO: make it `LLMId[]` where first item is desired model
  // and all the rest is possible fallbacks if for the different adapters
  model: LLMId
  adapterId?: LLMAdapterId
  maxTokens?: number
  temperature?: number
  topP?: number
}

/* The interface for LLM chat completion */
export type Chat = LLMOptions & {
  messages: ChatMessage[]
}

/* Broadcast LLM stream using the following format */
export type StreamOfLLMTokens = Promise<{
  /* Cancel streaming hook */
  cancel: () => void
  /* Stream that can be processed by `for await (const token of stream)` syntax */
  stream: AsyncIterable<string>
}>

/* The interface for LLM completion requests */
export type LLMFunctions = {
  chatToChat: (c: Chat) => Promise<Chat>
  chatToAnswer: (c: Chat) => Promise<string>
  chatToAnswerStream: (c: Chat) => StreamOfLLMTokens
  questionToChat: (o: LLMOptions, question: string) => Promise<Chat>
  questionToAnswer: (o: LLMOptions, question: string) => Promise<string>
  questionToAnswerStream: (o: LLMOptions, question: string) => StreamOfLLMTokens
}

/* Large Language Model Adapter */
export type LLMAdapter = {
  id: LLMAdapterId
  type: 'LLM'
  for: Set<LLMId>
  description: string
} & LLMFunctions

/* Large Image Model name like: 'DALL-E' */
export type LIMId = string & { __idFor: 'LLM' }

/* The interface for image generation request (PROTOTYPE) */
export type ImageRequest = {
  model: LIMId
  size: string
  prompt: string
}

/* Large Image Model Adapter */
export type LIMAdapter = {
  id: LIMAdapterId
  types: 'LIM'
  for: LIMId[] /* first: priority; rest: fallbacks */
}
