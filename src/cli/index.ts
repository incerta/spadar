import {
  NO_FLAGS_MESSAGE,
  INDEX_CMD_HELP,
  GENERATE_CMD_HELP,
  ADAPTER_CMD_HELP,
} from '../constants'
import config from '../config'

import { SpadarError } from '../utils/error'
import { initCli, cmd } from '../utils/command-line'
import { getMediator } from '../utils/mediator'

import { runChat, displayConversationContext } from './chat'
import {
  generateAdapterModule,
  generateAdapterConnectors,
  generateAdapterAPI,
} from './generate'
import { adapterUse, adapterUnuse, adapterList } from './adapter'

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
        if (flags.help || flags.h) {
          return console.log(INDEX_CMD_HELP)
        }

        if (flags.version || flags.v) {
          return console.log(config.version)
        }

        console.log(NO_FLAGS_MESSAGE)
      }
    ),
  ],

  [
    ['generate'],
    cmd(
      {
        help: { type: 'boolean' },
        h: { type: 'boolean' },
        silent: { type: 'boolean' },
        s: { type: 'boolean' },

        adapterModule: { type: 'string' },
        adapterConnectors: { type: 'string' },
        adapterAPI: { type: 'string' },
      },
      (flags) => {
        if (flags.help || flags.h) {
          return console.log(GENERATE_CMD_HELP)
        }

        if (typeof flags.adapterModule === 'string') {
          return generateAdapterModule({
            silent: flags.s || flags.silent,
            adapterModulePath: flags.adapterModule,
          })
        }

        if (typeof flags.adapterConnectors === 'string') {
          return generateAdapterConnectors({
            silent: flags.s || flags.silent,
            adapterModulePath: flags.adapterConnectors,
          })
        }

        if (typeof flags.adapterAPI === 'string') {
          return generateAdapterAPI({
            silent: flags.s || flags.silent,
            adapterModulePath: flags.adapterAPI,
          })
        }

        console.log(NO_FLAGS_MESSAGE)
      }
    ),
  ],

  [
    ['adapter'],
    cmd(
      {
        help: { type: 'boolean' },
        h: { type: 'boolean' },
        silent: { type: 'boolean' },
        s: { type: 'boolean' },

        use: { type: 'string' },
        unuse: { type: 'string' },
        list: { type: 'boolean' },
      },
      (flags) => {
        if (flags.help || flags.h) {
          return console.log(ADAPTER_CMD_HELP)
        }

        if (typeof flags.use === 'string') {
          return adapterUse({
            silent: flags.silent || flags.s,
            adapterModulePath: flags.use,
          })
        }

        if (typeof flags.unuse === 'string') {
          return adapterUnuse({
            usedAdapterName: flags.unuse,
          })
        }

        if (flags.list) {
          return adapterList()
        }

        console.log(NO_FLAGS_MESSAGE)
      }
    ),
  ],

  [
    ['chat'],
    cmd(
      {
        initialMessage: { type: 'string' },
        i: { type: 'string' },
      },
      (options, pipeInput) => {
        const pipeMessage =
          typeof pipeInput === 'string' ? pipeInput : undefined

        const initialMessage =
          options.i || options.initialMessage || pipeMessage

        const mediator = getMediator(config.availableAdapters)

        // FIXME: the cmd should pass `options` based on parsed flags
        const streamMessageRequest =
          mediator.textToText?.['spadar-adapter']?.openai?.chatMessageArr
            ?.stringStream

        if (streamMessageRequest === undefined) {
          throw new SpadarError('Cant find required adapater function')
        }

        const chatMessages = initialMessage
          ? [{ role: 'user' as const, content: initialMessage }]
          : undefined

        if (chatMessages) {
          displayConversationContext(chatMessages)
        }

        runChat(streamMessageRequest, chatMessages)
      }
    ),
  ],
])

runCli(process.argv.slice(2))
