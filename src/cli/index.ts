import { cli } from 'cleye'
import { version } from '../../package.json'

import chat from './chat'

cli({
  name: 'spadar',
  version: version,
  commands: [chat],
})
