import fs from 'fs'

import { SpadarError } from './error'
import { resolvePath } from './command-line'

import * as I from '../types'

const ADAPTER_ENTRY_POINT_PATH = 'src/adapter.ts'

export type UsedAdapter = {
  /**
   * The adapter module name
   **/
  name: string

  /**
   * The adapter module version
   **/
  version: string

  /**
   * Absolute path to the adapter module
   **/
  path: string

  /**
   * The record key is secret Key and record value is its description
   **/
  requiredKeys: Record<string, string>

  /**
   * Keys that actually specified
   **/
  specifiedKeys: Record<string, string>
}

type AvailableAdapter = UsedAdapter & {
  /**
   * Is all `requiredKeys` are specified in `specifiedKeys`
   *
   * TODO: we should resolve `ready` state of the specific
   *       connector because keys actually connector specific
   **/
  ready: boolean

  /**
   * Generic API for the adapter. If it is not present
   * that means we can't access the adapter entry point file
   * by the given UsedAdapter path
   **/
  adapter?: I.Adapter
}

// TODO: in the context of locally installed `spadar` module
//       the adapter entry point might changed. Currently we
//       testing hacky way of adapter connection through the
//       `spadar adapter --use` command
export const getAdapterByPath = (
  path: string
): { adapterAbsolutePath: string; adapter: I.Adapter } => {
  // TODO: the absolute path should be resolved outside of the function
  //       we don't really need to get it here and pass through another object
  const adapterModulePath = resolvePath(path)

  if (fs.existsSync(adapterModulePath) !== true) {
    throw new SpadarError(
      `Could't find adapter entry point: ${adapterModulePath}`
    )
  }

  const adapterEntryPointPath =
    adapterModulePath + '/' + ADAPTER_ENTRY_POINT_PATH

  const adapter = require(adapterEntryPointPath).default as I.Adapter

  return { adapter, adapterAbsolutePath: adapterModulePath }
}

export const getUsedAdapters = (resourcesDirectory: string): UsedAdapter[] => {
  fs.mkdirSync(resourcesDirectory, { recursive: true })
  const usedAdaptersFilePath = resourcesDirectory + '/used-adapters.json'

  if (fs.existsSync(usedAdaptersFilePath) === false) {
    fs.writeFileSync(usedAdaptersFilePath, '[]')
    return []
  }

  try {
    return JSON.parse(
      fs.readFileSync(usedAdaptersFilePath, 'utf-8')
    ) as UsedAdapter[]
  } catch (e) {
    throw new SpadarError(`Failed to parse JSON file: ${usedAdaptersFilePath}`)
  }
}

const hasAllKeys = (
  requiredKey: Record<string, string>,
  specifiedKeys: Record<string, string>
) => {
  for (const key in requiredKey) {
    if (typeof specifiedKeys[key] !== 'string') {
      return false
    }
  }

  return true
}

// FIXME: create actual `externalAPI` instead of `AvailableAdapter` list
export const getExternalAPI = (
  usedAdapters: UsedAdapter[]
): AvailableAdapter[] => {
  const availableAdapters: AvailableAdapter[] = []

  for (const usedAdapter of usedAdapters) {
    const adapter = fs.existsSync(usedAdapter.path)
      ? getAdapterByPath(usedAdapter.path).adapter
      : undefined

    const availableAdapter: AvailableAdapter = {
      ...usedAdapter,
      adapter,
      ready: hasAllKeys(usedAdapter.requiredKeys, usedAdapter.specifiedKeys),
    }

    availableAdapters.push(availableAdapter)
  }

  return availableAdapters
}
