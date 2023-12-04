// TODO move file to `src/cli-entry-point.ts`
import config from '../config'
import { SpadarError } from '../utils/error'
import { collectFlags } from '../utils/command-line'
import adapterRequirements from '../adapter-requirements'

import { runChat } from './chat'
import { runAdapter } from './adapter'

import * as I from '../types'

/* Set terminal tab title */
process.stdout.write('\x1b]0;Spadar\x07')

function cliRouter(argv: string[]) {
  const params = argv.slice(2)

  if (!params[0]) {
    throw new SpadarError('Specify required parameters')
  }

  if (params[0][0] === '-') {
    if (params[0] !== '-h' && params[0] !== '--help') {
      throw new SpadarError(
        `Only --help or -h command are allowed at the level`
      )
    }
    // FIXME: make help for the `spadar` cli root layer
    console.log('Help is under construction')
  }

  if (params[0] === 'chat') {
    const flags = collectFlags(
      {
        model: { type: 'stringUnion', of: ['one', 'two'] },
        fromClipboard: { type: 'boolean' },
        help: { type: 'boolean' },
      },
      params
    )

    if (flags.help) {
      // FIXME: show list of the available adapter -> connectors
      //        that support at least one of the cli chat requirements

      if (config.usedAdapters.length === 0) {
        throw new SpadarError(`
          There is no used adapters detected.
          Install adapter that satisfy at least one of
          cli chat requirements. And connect it to spadar
          by "spadar adapter --use $ADAPTER_MODULE_NAME_OR_PATH" cmd
        `)
      }

      let log = ''

      const [chatFeature] = adapterRequirements

      log += chatFeature.id + '\n\n'
      log += chatFeature.description + '\n\n'

      const matches: Array<{
        featureId: string
        requirementId: string
        requirementIndex: number
        adapterName: string
        connectorId: string
        transformation: I.Transformation
        transferMethod: I.TransferMethod
        isNotImplemented: boolean
      }> = []

      // TODO: what we want to display?
      //       spadar chat $ADAPTER_MODULE_NAME $CONNECTOR_ID $TRANSFER_METHOD
      //       available based on the used adapters

      for (const requirement of chatFeature.requirements) {
        for (const availableAdapter of config.externalAPI) {
          if (!availableAdapter.adapter) {
            continue
          }

          for (const connectorSchema of availableAdapter.adapter.schema) {
            for (const connectorTransformationSchema of connectorSchema.supportedIO) {
              // TODO: write function
            }
          }
        }
      }

      console.log(log)
      return
    }

    runChat(flags)
    return
  }

  if (params[0] === 'adapter') {
    const flags = collectFlags(
      {
        generate: { type: 'boolean' },
        use: { type: 'string' },
        silent: { type: 'boolean' },
        list: { type: 'boolean' },
      },
      params
    )

    runAdapter(flags)
    return
  }

  // FIXME: implement `spadar $ADAPTER_NAME $CONNECTOR_ID logic
}

cliRouter(process.argv)
