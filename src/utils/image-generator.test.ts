import { parseImageGenerationRequest } from './image-generator'
import { DeepPartial } from 'utility-types'
import * as I from '../types'

describe('parseImageGenerationRequest fn', () => {
  it('Should return null if image generation pattern is not found', () => {
    expect(parseImageGenerationRequest('')).toBeNull()
    expect(parseImageGenerationRequest('[img')).toBeNull()

    expect(parseImageGenerationRequest('[img:sm]')).toBeInstanceOf(Object)
    expect(parseImageGenerationRequest('[img:md]')).toBeInstanceOf(Object)
    expect(parseImageGenerationRequest('[img:lg]')).toBeInstanceOf(Object)
  })

  it('Should parse expected values', () => {
    const sizeLabel = ['sm', 'md', 'lg']

    sizeLabel.forEach((sizeLabel) => {
      const prompt = 'blue sky and green field'
      const message = `${prompt} [img:${sizeLabel}]`

      const result = parseImageGenerationRequest(message) as DeepPartial<I.ImageGenerationRequest>

      if (result === null) expect(true).toBe(false)

      expect(result.prompt).toBe(prompt)

      switch (sizeLabel) {
        case 'sm':
          expect(result.size).toBe('256x256')
          break
        case 'md':
          expect(result.size).toBe('512x512')
          break
        case 'lg':
          expect(result.size).toBe('1024x1024')
          break
      }
    })
  })
})
