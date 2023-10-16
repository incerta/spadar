import OpenAI from 'openai'
import config from '../config'
import * as I from '../types'

const openAI = new OpenAI({ apiKey: config.openAI.apiKey })

export async function generateAIResponseStream({ messages, temperature, model }: I.AIConversationReq) {
  const stream = await openAI.chat.completions.create({
    model: model || 'gpt-4',
    temperature: temperature || 0,
    messages,
    stream: true,
  })

  const makeResponseWriter = (writer: (messageToken: string) => void): Promise<string> =>
    new Promise(async (resolve) => {
      let completeMessage = ''

      for await (const part of stream) {
        const content = part.choices[0]?.delta?.content || ''
        completeMessage += content

        writer(content)
      }

      resolve(completeMessage)
    })

  return { makeResponseWriter }
}

export async function generateImage(req: I.ImageGenerationRequest) {
  const response = await openAI.images.generate({
    prompt: req.prompt,
    n: 1,
    size: req.size,
  })

  const url = response.data[0].url

  if (!url) {
    throw new Error('Could not get generated image URL')
  }

  return url
}
