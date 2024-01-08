import { version } from '../package.json'
import { toKebabCase } from './utils/string'
import { getUsedAdapters, getAvailableAdapters } from './utils/adapter'
import { SpadarError } from './utils/error'
import { resolvePath } from './utils/path'

const resourcesDirectory = ((): string => {
  const { SPADAR_RESOURCES_DIR } = process.env

  if (SPADAR_RESOURCES_DIR) return resolvePath(SPADAR_RESOURCES_DIR)

  // TODO: check if `.bashrc`, `.bash_profile` or `.zshrc` files exists
  //       and ask user to add required env into shell config file through
  //       interactive CLI Q/A

  throw new SpadarError(`
    The SPADAR_RESOURCES_DIR env variable is not specified.
    Please add it to your shell config manually. 
  `)
})()

const usedAdapters = getUsedAdapters(resourcesDirectory)
const availableAdapters = getAvailableAdapters(usedAdapters)

export default {
  version,

  resources: {
    rootDir: resourcesDirectory,
    usedAdaptersFilePath: resourcesDirectory + '/used-adapters.json',
  },

  usedAdapters,
  availableAdapters,

  /* All paths are relative to the root of ADAPTER module source */
  adapter: {
    schemaFilePath: 'src/schema.ts',
    packageJSON: 'package.json',
    connectorTypingsFilePath: (connectorId: string) =>
      `src/connectors/${toKebabCase(connectorId)}.typings.ts`,
    connectorSignaturePath: (connectorId: string) =>
      `src/connectors/${toKebabCase(connectorId)}.signature.ts`,
    connectorFilePath: (connectorId: string) =>
      `src/connectors/${toKebabCase(connectorId)}.ts`,
    adapterEntryPoint: `dist/adapter.js`,
  } as const,
}
