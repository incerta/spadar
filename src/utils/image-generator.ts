import * as I from '../types'

const DEFAULT_SIZE = '256x256'

/*
 *  Valid string example:
 *  "blue sky and green field [img:800x600]"
 */
export function parseImageGenerationRequest(source: string): null | I.ImageUnit {
  const pattern = /\[img:(sm|lg|md)\]/
  const match = source.match(pattern)

  if (!match) {
    return null
  }

  const size = ((): I.ImageUnit['size'] => {
    const sizeLabel = match[1]

    if (typeof sizeLabel !== 'string') return DEFAULT_SIZE

    switch (match[1].trim()) {
      case 'sm':
        return '256x256'
      case 'md':
        return '512x512'
      case 'lg':
        return '1024x1024'
    }

    return DEFAULT_SIZE
  })()

  const prompt = source.slice(0, match.index).trim()

  return { prompt, size, model: 'DALL-E' as I.ImageModelId }
}
