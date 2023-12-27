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
    Please add it to your shell config manually. The resources
    directory of the globally installed module will store
    chat conversation logs, connection to globally installed
    adapters and required API keys for them.
  `)
})()

const usedAdapters = getUsedAdapters(resourcesDirectory)
const availableAdapters = getAvailableAdapters(usedAdapters)

export default {
  /* Spadar module version */
  version: version,

  resources: {
    /* The directory for spadar logs, keys and adapter > spadar API connection */
    rootDir: resourcesDirectory,

    /*
     * Adapters that had been connected to the spadar through
     * the `spadar adapter --use $ADAPTER_MODULE_PATH` command
     **/
    usedAdaptersFilePath: resourcesDirectory + '/used-adapters.json',
  },

  /**
   * FIXME: write description of the property
   **/
  usedAdapters,

  /**
   * Based on `usedAdapters` we create intermediate API which uses specified
   * keys by the user in order to omit `keys` argument at each connector IO function
   *
   * Result API should exclude connector IO functions that not yet specified
   * (connector signature is not mutated by connector API file)
   **/
  availableAdapters,

  /* All paths are relative to the root of ADAPTER module source */
  adapter: {
    /**
     * Adapter schema is the source file for generations:
     *
     *  - Connector typings
     *  - Connector API signature
     *  - Connector API index file with signature mutations
     *  - Adapter API entry point
     *
     * Expected paths of the files are specified here.
     **/
    schemaFilePath: 'src/schema.ts',
    packageJSON: 'package.json',

    /**
     * File path to a specific CONNECTOR typings file
     * which MUST BE generated by SPADAR cli AUTOMATICALLY
     **/
    connectorTypingsFilePath: (connectorId: string) =>
      `src/connectors/${toKebabCase(connectorId)}.typings.ts`,

    /**
     * File path to a specific CONNECTOR API signature file
     * which MUST BE generated by SPADAR cli AUTOMATICALLY
     **/
    connectorSignaturePath: (connectorId: string) =>
      `src/connectors/${toKebabCase(connectorId)}.signature.ts`,

    /**
     * File path to a specific CONNECTOR which MUST BE generated
     * by SPADAR cli INITIALLY but then edited by user MANUALLY
     **/
    connectorFilePath: (connectorId: string) =>
      `src/connectors/${toKebabCase(connectorId)}.ts`,

    /**
     * File path to ADAPTER API entry point
     * MUST BE generated by SPADAR cli AUTOMATICALLY
     **/
    adapterEntryPoint: `src/adapter.ts`,
  } as const,
}
