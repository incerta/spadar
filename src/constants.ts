export const NO_FLAGS_MESSAGE = `
No known flags are specified. Run "spadar [command] --help" for more information
`

export const INDEX_CMD_HELP = `
Usage: spadar [flag]

  -h, --help                  Outputs usage information.
  -v, --version               Outputs the SPADAR version number.

Usage: spadar [command]

  chat                        Starts a chat with a specific textToText adapter.
  generate                    Codegen ADAPTER module boilerplate and other resources.
  adapter                     Use/unuse/list ADAPTER modules.

Obtain detailed help for each command by using cmd: spadar [command] --help
`

export const GENERATE_CMD_HELP = `
Usage: spadar generate [flag]

  -h, --help                  Outputs usage information.
  -s, --silent                Doesn't output anything except errors.

  --adapterModule $PATH       Creates the ADAPTER module boilerplate. The $PATH
                              should specify the desired directory name which
                              will be used as the ADAPTER MODULE NAME.

  --adapterConnectors $PATH   ↓↓↓

  Generates the adapter API based on "$PATH/src/schema.ts". The ADAPTER SCHEMA is
  an array of CONNECTOR SCHEMA. The SPADAR CLI will create 3 files for each connector:

  CONNECTOR TYPINGS
    "$PATH/src/connectors/$\{toKebabCase(connectorId)}.typings.ts"

    These typings are used in the CONNECTOR SIGNATURE (connector API contract).
    This file MUST NOT be edited manually.

  CONNECTOR SIGNATURE
    "$PATH/src/connectors/$\{toKebabCase(connectorId)}.signature.ts"

    This is the intermediate API structure of the CONNECTOR API where each end function
    throws a "Not implemented" error and has a special context.
    This file MUST NOT be edited manually.

  CONNECTOR USER IMPLEMENTATION
    "$PATH/src/connectors/$\{toKebabCase(connectorId)}.connector.ts"

    This is the file where the ADAPTER DEVELOPER implements API functions based
    on the SIGNATURE mutations. This file will remain untouched by our CLI
    codegen tools if it exists already, thus it MUST BE edited manually.

  In the end, we apply the "npm run prettify" script to make code formatting consistent.


  --adapterAPI $PATH          ↓↓↓

  This should be called when the CONNECTOR USER IMPLEMENTATION is ready.
  It runs the "npm run quality-check" script. If no issues are found, it creates the following files:

  ADAPTER ENTRYPOINT
    "$PATH/src/adapter.ts"

    This file is where all CONNECTOR USER IMPLEMENTATIONS are gathered into one object under
    the "connectors" key by CONNECTOR ID. The object also exposes "schema", "moduleName"
    and "moduleVersion". The name and version are mirrored from the module "package.json" file.
    This file MUST NOT be edited manually.

  ADAPTER INDEX
    "$PATH/src/index.ts"

    This file exposes all the CONNECTOR USER IMPLEMENTATIONS gathered into one object by
    the "connectors" key by CONNECTOR ID. This file CAN BE edited manually. SPADAR is more
    interested in the "src/adapter.ts" file so one can extend the ADAPTER module behavior
    beyond any SPADAR requirements.

  In the end, we apply the "npm run prettify" script to make code formatting consistent.
`

export const ADAPTER_CMD_HELP = `
Usage: spadar adapter [flag]

  -h, --help                  Outputs usage information.
  -s, --silent                Doesn't output anything except errors.

  --use $ADAPTER_MODULE_PATH_OR_NAME

  Based on the "SPADAR_RESOURCES_DIR" specified in your shell config,
  SPADAR CLI will create or update the "used-adapters.json" file.
  This file stores information about the used ADAPTER modules such
  as the name, version, path, specifiedKeys and requiredKeys.

  If you connect the ADAPTER module from its source, don't forget to build it first.

  --unuse $ADAPTER_MODULE_NAME

  Remove adapter of the following name from the "$SPADAR_RESOURCES_DIR/used-adapters.json"
`
