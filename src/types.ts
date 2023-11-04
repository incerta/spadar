/* Large Language Model name like: 'gpt-3.5-turbo' | 'gpt-4' */
export type TextModelId = string & { __idFor: 'TextModel' }

/* Large Image Model name like: 'DALL-E' */
export type ImageModelId = string & { __idFor: 'ImageModel' }

/* A unique identifier for a Large Language Model adapter */
export type TextAdapterId = string & { __idFor: 'TextAdapter' }

/* A unique identifier for a Large Image Model adapter */
export type ImageAdapterId = string & { __idFor: 'ImageAdapter' }

// TODO: the interface is locked on OpenAI
// should be more generic solution
/* A message from/for a LLM */
export type TextUnit = {
  role:
    | 'system' // Role that sets the behavior of the assistant
    | 'assistant' // AI model that generates conversation responses
    | 'user' // Role that provides input to the conversation
  content: string
}

export type TextOptions = {
  model: TextModelId
  adapterId?: TextAdapterId
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
}

/* Large Language Model (LLM) Adapter */
export type TextAdapter = TextFunctions & {
  id: TextAdapterId
  type: 'LLM'
  for: Set<TextModelId>
  description: string
}

/* The interface for image generation request (PROTOTYPE) */
export type ImageUnit = {
  model: ImageModelId
  size: string
  prompt: string
}

/* Large Image Model (LIM) Adapter */
export type ImageAdapter = {
  id: ImageAdapterId
  types: 'LIM'
  for: ImageModelId[] /* first: priority; rest: fallbacks */
}
