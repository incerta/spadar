/* Large Language Model name like: 'gpt-3.5-turbo' | 'gpt-4' */
export type LLMId = string & { __idFor: 'LLM' }

/* A unique identifier for a Large Language Model adapter */
export type LLMAdapterId = string & { __idFor: 'ModelAdapter' }

/* A unique identifier for a Large Image Model adapter */
export type LIMAdapterId = string & { __idFor: 'ModelAdapter' }

/* A message from/for a LLM */
export type TextUnit = {
  role:
    | 'system' // Role that sets the behavior of the assistant
    | 'assistant' // AI model that generates conversation responses
    | 'user' // Role that provides input to the conversation
  content: string
}

export type TextOptions = {
  model: LLMId[]
  adapterId?: LLMAdapterId
  maxTokens?: number
  temperature?: number
  topP?: number
}

/* The interface for LLM chat completion */
export type Chat = TextOptions & {
  messages: TextUnit[]
}

/* Broadcast LLM stream using the following format */
export type StreamOfText = Promise<{
  /* Cancel streaming hook */
  cancel: () => void
  /* Stream that can be processed by `for await (const token of stream)` syntax */
  stream: AsyncIterable<string>
}>

/* The interface for LLM completion requests */
export type TextFunctions = {
  chatToChat: (c: Chat) => Promise<Chat>
  chatToAnswer: (c: Chat) => Promise<string>
  chatToAnswerStream: (c: Chat) => StreamOfText
  questionToChat: (o: TextOptions, question: string) => Promise<Chat>
  questionToAnswer: (o: TextOptions, question: string) => Promise<string>
  questionToAnswerStream: (o: TextOptions, question: string) => StreamOfText
}

/* Large Language Model (LLM) Adapter */
export type TextAdapter = TextFunctions & {
  id: LLMAdapterId
  type: 'LLM'
  for: Set<LLMId>
  description: string
}

/* Large Image Model name like: 'DALL-E' */
export type LIMId = string & { __idFor: 'LLM' }

/* The interface for image generation request (PROTOTYPE) */
export type ImageUnit = {
  model: LIMId
  size: string
  prompt: string
}

/* Large Image Model (LIM) Adapter */
export type ImageAdapter = {
  id: LIMAdapterId
  types: 'LIM'
  for: LIMId[] /* first: priority; rest: fallbacks */
}
