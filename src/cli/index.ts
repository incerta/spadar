import dedent from 'dedent'

import config from '../config'
import { SpadarError } from '../utils/error'
import { initCli, cmd } from '../utils/command-line'
import { getMediator } from '../utils/mediator'

import { runChat } from './chat'
import { runAdapter } from './adapter'

/* Set terminal tab title */
process.stdout.write('\x1b]0;Spadar\x07')

const runCli = initCli([
  [
    [],
    cmd(
      {
        help: 'boolean',
        h: 'boolean',
        version: 'boolean',
        v: 'boolean',
      },
      (flags) => {
        if (flags.version || flags.version) {
          console.log(config.version)
          return
        }

        if (flags.help || flags.help) {
          // TODO: show the number of available adapters for the given
          //       transformation type in the parenthesis like:
          //       "adapters for text to text transformation (12)"

          // FIXME: on the early stages of development it could be reasonable
          //        approach to support only `staticToStatic` transfer method
          //        for TRANSFORMATION CLI capabilities

          const helpMessage = dedent(`
          Usage: spadar [flag]

            -h, --help                  output usage information
            -v, --version               output the version number

          Usage: spadar [command]

            adapter                     generate/validate/use the external adapter modules
            chat                        start chat with with specific textToText adapter

          Usage: spadar [transformation]

            CLI stdin and stdout for data transformation by external adapter module

            Examples:  echo "Hello!" | spadar textToText spadar-adapter GPT > file.txt
                       cat image.jpg | spadar imageToImage spadar-adapter DALL-E > file.jpg
     
          Transformations:

            textToText                  adapters for text to text transformation
            textToCode                  adapters for text to code transformation
            textToImage                 adapters for text to image transformation
            textToAudio                 adapters for text to audio transformation
            textToVideo                 adapters for text to video transformation

            codeToText                  adapters for code to text transformation
            codeToCode                  adapters for code to code transformation

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
      }
    ),
  ],

  [
    ['adapter'],
    cmd(
      {
        generate: { type: 'boolean' },
        use: { type: 'string' },
        silent: { type: 'boolean' },
        list: { type: 'boolean' },
      },
      runAdapter
    ),
  ],

  [
    ['chat'],
    cmd({}, (_options, pipeInput) => {
      const mediator = getMediator(config.availableAdapters)

      // FIXME: debug pipeInput message
      const initialMessage =
        typeof pipeInput === 'string' ? pipeInput : undefined

      // FIXME: the comman should pass `options` based on parsed flags
      const streamMessageRequest =
        mediator.textToText?.['outside-adapter']?.openai?.chatMessageArr
          ?.stringStream

      if (streamMessageRequest === undefined) {
        throw new SpadarError('Cant find required adapater function')
      }

      runChat(streamMessageRequest)
    }),
  ],
])

runCli(process.argv.slice(2))
