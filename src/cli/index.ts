// TODO move file to `src/cli-entry-point.ts`
import dedent from 'dedent'
import config from '../config'
import { SpadarError } from '../utils/error'
import { collectFlags } from '../utils/command-line'
import adapterRequirements from '../adapter-requirements'
import * as schema from '../utils/schema'

import { runChat } from './chat'
import { runAdapter } from './adapter'

import * as I from '../types'

type APIMatch = {
  requirementId: string
  requirementDescription: string
  adapterName: string
  connectorId: string
  transformation: I.Transformation
  transferMethod: I.TransferMethod
  ioAccessors: Array<[inputKey: string, outputKey: string]>
}

/* Set terminal tab title */
process.stdout.write('\x1b]0;Spadar\x07')

function cliRouter(argv: string[]) {
  const params = argv.slice(2)

  if (!params[0]) {
    throw new SpadarError('Specify required parameters')
  }

  if (params[0][0] === '-') {
    const flag = params[0]

    if (flag === '-v' || flag === '--version') {
      console.log(config.version)
      return
    }

    if (flag === '-h' || flag === '--help') {
      // TODO: show the number of available adapters for the given
      //       transformation type in the parenthesis like:
      //       "adapters for text to text transformation (12)"

      const helpMessage = dedent(`
        Usage: spadar [flag]

          -h, --help                  output usage information
          -v, --version               output the version number

        Usage: spadar [command]

          adapter                     generate/validate/use the external adapter modules
          chat                        start chat with with specific textToText adapter

        Usage: spadar [transformation]

          CLI stdin and stdout for data transformation by external adapter module

          Examples:  echo "Hello!" | spadar textToText spadar-adapter GPT staticToStatic > file.txt
                     cat image.jpg | spadar imageToImage spadar-adapter DALL-E staticToStatic > file.jpg
   
        Transformations:

          textToText                  adapters for text to text transformation
          textToImage                 adapters for text to image transformation
          textToAudio                 adapters for text to audio transformation
          textToVideo                 adapters for text to video transformation

          imageToText                 adapters for image to text transformation
          imageToImage                adapters for image to image transformation
          imageToAudio                adapters for image to audio transformation
          imageToVideo                adapters for image to video transformation

          audioToText                 adapters for audio to text transformation
          audioToImage                adapters for audio to image transformation
          audioToAudio                adapters for audio to audio transformation
          audioToVideo                adapters for audio to video transformation

          videoToText                 adapters for video to text transformation
          videoToImage                adapters for video to image transformation
          videoToAudio                adapters for video to audio transformation
          videoToVideo                adapters for video to video transformation

          Get detailed help on each transformation by: spadar [transformation] --help
    `)

      console.log('\n' + helpMessage + '\n')
      return
    }

    console.log(`Unsupported flag: ${flag}`)

    return
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

      const [chatFeature] = adapterRequirements

      const apiMatches: APIMatch[] = []

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
              const requirementMatches = schema.getRequirementToSchemaMatches(
                requirement.schema,
                connectorTransformationSchema
              )

              requirementMatches?.forEach((requirementMatch) => {
                apiMatches.push({
                  requirementId: requirement.id,
                  requirementDescription: requirement.description,
                  adapterName: availableAdapter.name,
                  connectorId: connectorSchema.id,
                  transformation: requirement.schema.type,
                  transferMethod: requirementMatch.transferMethod,
                  ioAccessors: requirementMatch.ioSchemas.map(
                    ([input, output]) => {
                      const inputKey = schema.generateIOPrimitive(
                        requirementMatch.transferMethod,
                        'input',
                        input
                      ).key

                      const outputKey = schema.generateIOPrimitive(
                        requirementMatch.transferMethod,
                        'output',
                        output
                      ).key

                      return [inputKey, outputKey]
                    }
                  ),
                })
              })
            }
          }
        }
      }

      if (apiMatches.length === 0) {
        // TODO: add link to the requirement details and link to our
        //       default adapter module
        console.log('No suitable CONNECTORS is found for the CHAT CLI')
        return
      }

      console.log(
        'Based on the used adapters we you might use the following CLI commands:\n\n' +
          'spadar chat $USED_ADAPTER_NAME $CONNECTOR_ID $TRANSFER_METHOD'
      )

      apiMatches.forEach((match) => {
        // TODO: group available CLI API signatures by requirement
        console.log(
          `spadar chat ${match.adapterName} ${match.connectorId} ${match.transferMethod}`
        )
      })
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
