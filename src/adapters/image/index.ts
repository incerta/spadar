import openAIAdapter from './openai'
import * as I from '../../types'
// FIXME: connect when debug adapter is ready
// import debugAdapter from './debug-adapter'
const debugAdapter = {} as I.ImageAdapter

/* If two adapters handling same model the last one in the array will be selected */
const BUILT_IN_IMAGE_ADAPTERS: I.ImageAdapter[] = [debugAdapter, openAIAdapter]

const getFormattedMessage = (title: string, items: string[]) =>
  '\n\n' + title + '\n\n' + items.map((x) => '  - ' + x).join(',\n') + '\n'

export const selectTextAdapter = (() => {
  const externalAdapters: I.TextAdapter[] = (() => {
    // TODO: plan to put external adapter resolution logic here
    return []
  })()

  const allAdapters = [...externalAdapters, ...BUILT_IN_IMAGE_ADAPTERS]

  const byId = new Map<I.TextAdapterId, I.TextAdapter>()
  const byModelId = new Map<I.TextModelId, I.TextAdapter>()

  const supportedModelIdSet = new Set<I.TextModelId>()
  const supportedAdapterIdSet = new Set<I.TextAdapterId>()

  allAdapters.forEach((adapter) => {
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
