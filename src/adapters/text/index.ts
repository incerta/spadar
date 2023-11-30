// @ts-nocheck
import debugAdapter from './debug-adapter'
import openAIAdapter from './openai'
import * as I from '../../types'

/* If two adapters handling same model the last one in the array will be selected */
const BUILT_IN_LLM_ADAPTERS: I.TextAdapter[] = [debugAdapter, openAIAdapter]

const getFormattedMessage = (title: string, items: string[]) =>
  '\n\n' + title + '\n\n' + items.map((x) => '  - ' + x).join(',\n') + '\n'

export const selectLLMAdapter = (() => {
  const externalLLMAdapters: I.TextAdapter[] = (() => {
    // TODO: plan to put external adapter resolution logic here
    return []
  })()

  const allLLMAdapters = [...externalLLMAdapters, ...BUILT_IN_LLM_ADAPTERS]

  const byId = new Map<I.TextconnectorId, I.TextAdapter>()
  const byModelId = new Map<I.TextModelId, I.TextAdapter>()

  const supportedModelIdSet = new Set<I.TextModelId>()
  const supportedconnectorIdSet = new Set<I.TextconnectorId>()

  allLLMAdapters.forEach((adapter) => {
    supportedconnectorIdSet.add(adapter.id)
    byId.set(adapter.id, adapter)

    adapter.for.forEach((model) => {
      supportedModelIdSet.add(model)
      byModelId.set(model, adapter)
    })
  })

  const supportedModelsMessage = getFormattedMessage('Supported models:', [
    ...supportedModelIdSet,
  ])
  const availableAdaptersMessage = getFormattedMessage('Availabled adapters:', [
    ...supportedconnectorIdSet,
  ])

  return { byId, byModelId, supportedModelsMessage, availableAdaptersMessage }
})()
