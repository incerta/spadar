import OpenAI from 'openai'
import config from '../../config'
import { DEFAULT_IMAGE_MODEL } from '../../constants'
import * as I from '../../types'

const ADAPTER_ID = 'OpenAI-LIM-spadar-built-in-image-adapter' as I.ImageAdapterId
const SUPPORTED_MODELS = new Set([DEFAULT_IMAGE_MODEL]) as Set<I.ImageModelId>

const openAI = new OpenAI({ apiKey: config.openAI.apiKey })

const adapter: I.ImageAdapter = {
  id: ADAPTER_ID,
  description: 'Built in OpenAI models adapter',
  for: SUPPORTED_MODELS,
  promptToBinary: () => {
    throw Error('Not supported yet')
  },
  promptToLink: async (o, prompt) => {
    const response = await openAI.images.generate({
      prompt,
      n: 1,
      // FIXME: hardcoded option
      size: '256x256',
    })

    const url = response.data[0].url

    if (!url) {
      throw new Error('Could not get generated image URL')
    }

    return { type: 'link', url }
  },
  unitToBinary: () => {
    throw Error('Not supported yet')
  },
  unitToLink: () => {
    throw Error('Not supported yet')
  },
}

export default adapter
