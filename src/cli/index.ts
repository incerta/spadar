import { cli } from 'cleye'
import { version } from '../../package.json'

import chat from './chat'
import adapter from './adapter'

/* Set terminal tab title */
process.stdout.write('\x1b]0;Spadar\x07')

cli({
  name: 'spadar',
  version: version,
  commands: [chat, adapter],
})
