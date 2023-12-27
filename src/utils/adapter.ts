import fs from 'fs'

import { SpadarError } from './error'
import { resolvePath } from './path'

import * as I from '../types'

const ADAPTER_ENTRY_POINT_PATH = 'src/adapter.ts'

/**
 * The `UsedAdapter` array is extracted from `used-adapters.json` file
 * of the `config.resources.usedAdaptersFilePath`
 **/
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

export type AvailableAdapter = UsedAdapter & {
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

// TODO: when we use the ADAPTER in a hacky way by its source
//        and the integrity of this source is corrupted
//        it affects our test suits and cli commands, error
//        that should be on the ADAPTER side leaks into our
//        MEDIATOR source. We probably can partially negate
//        this by invoking `externalAPI` as function only where
//        it is needed but it will be a bad compromise. Better
//        either not use the hacky way at all or validate the integrity
//        of the used adapter right away
export const getAvailableAdapters = (
  usedAdapters: UsedAdapter[]
): AvailableAdapter[] => {
  const availableAdapters: AvailableAdapter[] = []

  for (const usedAdapter of usedAdapters) {
    try {
      const adapter = fs.existsSync(usedAdapter.path)
        ? getAdapterByPath(usedAdapter.path).adapter
        : undefined

      const availableAdapter: AvailableAdapter = {
        ...usedAdapter,
        adapter,
        ready: hasAllKeys(usedAdapter.requiredKeys, usedAdapter.specifiedKeys),
      }

      availableAdapters.push(availableAdapter)
    } catch (_) {
      continue
    }
  }

  return availableAdapters
}
