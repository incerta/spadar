import * as I from '../types'

/*
 *  Valid string example:
 *  "blue sky and green field [img:800x600]"
 */
export function parseImageGenerationRequest(source: string): null | I.ImageGenerationRequest {
  const pattern = /\[img?.+:(\d+)x(\d+)\]/
  const match = source.match(pattern)

  if (!match) {
    return null
  }

  const prompt = source.slice(0, match.index).trim()

  const width = parseInt(match[1])
  const height = parseInt(match[2])

  return {
    prompt,
    size: { width, height },
  }
}
