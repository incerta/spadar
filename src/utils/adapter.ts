import { selectLLMAdapter } from '../adapters/LLM'
import * as I from '../types'

export const getLLMAdapter = (model: I.LLMId, adapterIdOverride?: I.LLMAdapterId): I.LLMAdapter => {
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
