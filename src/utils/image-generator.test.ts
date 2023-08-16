import { parseImageGenerationRequest } from './image-generator'
import { DeepPartial } from 'utility-types'
import * as I from '../types'

describe('parseImageGenerationRequest fn', () => {
  it('Should return null if image generation pattern is not found', () => {
    expect(parseImageGenerationRequest('')).toBeNull()
    expect(parseImageGenerationRequest('[img')).toBeNull()
    expect(parseImageGenerationRequest('[img:V00x600]')).toBeNull()
    expect(parseImageGenerationRequest('[img:800x600]')).toBeInstanceOf(Object)
  })

  it('Should parse expected values', () => {
    const expected: I.ImageGenerationRequest = {
      size: {
        width: 800,
        height: 600,
      },
      prompt: 'blue sky and green field',
    }

    const message = `blue sky and green field [img:800x600]`
    const result = parseImageGenerationRequest(message) as DeepPartial<I.ImageGenerationRequest>

    if (result === null) expect(true).toBe(false)

    expect(result.prompt).toBe(expected.prompt)
    expect(result.size?.width).toBe(expected.size.width)
    expect(result.size?.height).toBe(expected.size.height)
  })
})
