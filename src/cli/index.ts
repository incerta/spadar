import { SpadarError } from '../utils/error'
import { collectFlags } from '../utils/command-line'

import { runChat } from './chat'
import { runAdapter } from './adapter'

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
    runChat({})
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
