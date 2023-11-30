// @ts-nocheck
// DEPRECATED
import * as I from '../types'
import { selectLLMAdapter } from '../adapters/text'

// FIXME: this approach is DEPRECATED and should be removed
//        when first external adapter is ready
export const getTextAdapter = (
  model: string,
  connectorIdOverride?: string
): any => {
  if (connectorIdOverride) {
    const requestedAdapter = selectLLMAdapter.byId.get(connectorIdOverride)

    if (!requestedAdapter) {
      throw Error(
        `Could't find given adapter: "${connectorIdOverride}".${selectLLMAdapter.availableAdaptersMessage}`
      )
    }

    return requestedAdapter
  }

  const selectedAdapter = selectLLMAdapter.byModelId.get(model)

  if (!selectedAdapter) {
    throw Error(
      `Could't find adapter for the given model: "${model}".${selectLLMAdapter.supportedModelsMessage}`
    )
  }

  return selectedAdapter
}

const getFormattedMessage = (title: string, items: string[]) =>
  '\n\n' + title + '\n\n' + items.map((x) => '  - ' + x).join(',\n') + '\n'

type InferSetType<T> = T extends Set<infer U> ? U : never

export const collectAdapters = <T extends I.AdapterType, A extends I.Adapter>(
  adapterType: T,
  builtInAdapters: A extends { type: T } ? A : never
) => {
  // TODO: use caching tool like `splendid-ui` for caching
  //
  // cache invalidation strategy:
  // if `RESOURCES_DIRECTORY` files are not changed
  // return cached `adapterSelectors` object right away
  // or cache result of the `getAdapterSelectors` in
  // `RESOURCES_DIRECTORY/.cache/adapters/${adapterType}
  //

  const cache = (() => {})()

  const externalAdapters: I.TextAdapter[] = (() => {
    // TODO: plan to put external adapter resolution logic here
    return []
  })()

  const allAdapters = [...externalAdapters, ...builtInAdapters]

  const byId = new Map<AdapterList[0]['id'], AdapterList[0]>()
  const byModelId = new Map<
    InferSetType<AdapterList[0]['for']>,
    AdapterList[0]
  >()

  const supportedModelIdSet = new Set<I.TextModelId>()
  const supportedconnectorIdSet = new Set<I.TextconnectorId>()

  allAdapters.forEach((adapter) => {
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
}
