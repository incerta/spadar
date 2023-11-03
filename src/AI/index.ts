import OpenAI from 'openai'
import config from '../config'
import * as I from '../types'

const openAI = new OpenAI({ apiKey: config.openAI.apiKey })

export async function generateImage(req: I.ImageRequest) {
  const response = await openAI.images.generate({
    prompt: req.prompt,
    n: 1,
    // TODO: fix when we define specification for LIMAdapter
    size: req.size as any,
  })

  const url = response.data[0].url

  if (!url) {
    throw new Error('Could not get generated image URL')
  }

  return url
}
