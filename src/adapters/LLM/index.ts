import debugAdapter from './debug-adapter'
import openAIAdapter from './openai'
import * as I from '../../types'

/* If two adapters handling same model the last one in the array will be selected */
const BUILT_IN_LLM_ADAPTERS: I.LLMAdapter[] = [debugAdapter, openAIAdapter]

const getFormattedMessage = (title: string, items: string[]) =>
  '\n\n' + title + '\n\n' + items.map((x) => '  - ' + x).join(',\n') + '\n'

export const selectLLMAdapter = (() => {
  const externalLLMAdapters: I.LLMAdapter[] = (() => {
    // TODO: plan to put external adapter resolution logic here
    return []
  })()

  const allLLMAdapters = [...externalLLMAdapters, ...BUILT_IN_LLM_ADAPTERS]

  const byId = new Map<I.LLMAdapterId, I.LLMAdapter>()
  const byModelId = new Map<I.LLMId, I.LLMAdapter>()

  const supportedModelIdSet = new Set<I.LLMId>()
  const supportedAdapterIdSet = new Set<I.LLMAdapterId>()

  allLLMAdapters.forEach((adapter) => {
    supportedAdapterIdSet.add(adapter.id)
    byId.set(adapter.id, adapter)

    adapter.for.forEach((model) => {
      supportedModelIdSet.add(model)
      byModelId.set(model, adapter)
    })
  })

  const supportedModelsMessage = getFormattedMessage('Supported models:', [...supportedModelIdSet])
  const availableAdaptersMessage = getFormattedMessage('Availabled adapters:', [...supportedAdapterIdSet])

  return { byId, byModelId, supportedModelsMessage, availableAdaptersMessage }
})()
