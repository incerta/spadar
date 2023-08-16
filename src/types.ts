export type GPTMessage = {
  role: 'system' | 'assistant' | 'user'
  content: string
}

export type AIRequest = {
  messages: GPTMessage[]
  /* What sampling temperature to use, between 0 and 2. 
    Higher values like 0.8 will make the output more random,
    while lower values like 0.2 will make it more focused and
    deterministic. We generally recommend altering this or top_p but not both.
    If the value is not specified – the system will use 0 as default.
    */
  temperature?: number
  model?: 'gpt-3.5-turbo'
}

export type ImageGenerationRequest = {
  size: {
    width: number
    height: number
  }
  prompt: string
}
