import { selectLLMAdapter } from '../adapters/text'
import * as I from '../types'

export const getTextAdapter = (model: I.TextModelId, adapterIdOverride?: I.TextAdapterId): I.TextAdapter => {
  if (adapterIdOverride) {
    const requestedAdapter = selectLLMAdapter.byId.get(adapterIdOverride)

    if (!requestedAdapter) {
      throw Error(`Could't find given adapter: "${adapterIdOverride}".${selectLLMAdapter.availableAdaptersMessage}`)
    }

    return requestedAdapter
  }

  const selectedAdapter = selectLLMAdapter.byModelId.get(model)

  if (!selectedAdapter) {
    throw Error(`Could't find adapter for the given model: "${model}".${selectLLMAdapter.supportedModelsMessage}`)
  }

  return selectedAdapter
}
